package services

import (
	"fmt"
	"time"

	"ku-asset/internal/models"

	"gorm.io/gorm"
)

type RequestService struct {
	db             *gorm.DB
	productService *ProductService
}

type RequestFilter struct {
	Status       string
	DepartmentID string
	Page         int
	Limit        int
}

type CreateRequestData struct {
	UserID   string
	Purpose  string
	Notes    string
	Priority string
	Items    []CreateRequestItem
}

type CreateRequestItem struct {
	ProductID string
	Quantity  int
	Purpose   string
	Notes     string
}

func NewRequestService(db *gorm.DB, productService *ProductService) *RequestService {
	return &RequestService{
		db:             db,
		productService: productService,
	}
}

func (rs *RequestService) CreateRequest(data CreateRequestData) (*models.Request, error) {
	// Start transaction
	tx := rs.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate products and quantities
	for _, item := range data.Items {
		product, err := rs.productService.GetProductByID(item.ProductID)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("product %s not found", item.ProductID)
		}

		if !product.IsAvailableForBorrow(item.Quantity) {
			tx.Rollback()
			return nil, fmt.Errorf("insufficient quantity for product %s", product.Name)
		}
	}

	// Create request
	priority := data.Priority
	if priority == "" {
		priority = "NORMAL"
	}

	request := models.Request{
		UserID:       data.UserID,
		Purpose:      data.Purpose,
		Notes:        data.Notes,
		Priority:     models.RequestPriority(priority),
		Status:       models.RequestStatusPending,
		RequestDate:  time.Now(),
		RequiredDate: time.Now().AddDate(0, 0, 1), // Default: tomorrow
	}

	if err := tx.Create(&request).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Create request items
	for _, itemData := range data.Items {
		item := models.RequestItem{
			RequestID: request.ID,
			ProductID: itemData.ProductID,
			Quantity:  itemData.Quantity,
			Purpose:   itemData.Purpose,
			Notes:     itemData.Notes,
			Status:    models.RequestStatusPending,
		}

		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// Update product available quantity
		if err := tx.Model(&models.Product{}).
			Where("id = ?", itemData.ProductID).
			Update("available_quantity", gorm.Expr("available_quantity - ?", itemData.Quantity)).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Load complete request with items
	var completeRequest models.Request
	err := rs.db.Preload("User").Preload("Items.Product").
		Where("id = ?", request.ID).First(&completeRequest).Error

	if err != nil {
		return nil, err
	}

	return &completeRequest, nil
}

func (rs *RequestService) GetUserRequests(userID string, filter RequestFilter) ([]models.Request, int64, error) {
	var requests []models.Request
	var total int64

	query := rs.db.Model(&models.Request{}).
		Preload("Items.Product.Category").
		Preload("ApprovedBy").
		Where("user_id = ?", userID)

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and order
	offset := (filter.Page - 1) * filter.Limit
	if err := query.Order("created_at DESC").
		Offset(offset).Limit(filter.Limit).
		Find(&requests).Error; err != nil {
		return nil, 0, err
	}

	return requests, total, nil
}

func (rs *RequestService) GetAllRequests(filter RequestFilter) ([]models.Request, int64, error) {
	var requests []models.Request
	var total int64

	query := rs.db.Model(&models.Request{}).
		Preload("User.Department").
		Preload("Items.Product.Category").
		Preload("ApprovedBy").
		Preload("IssuedBy")

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.DepartmentID != "" {
		query = query.Joins("JOIN users ON users.id = requests.user_id").
			Where("users.department_id = ?", filter.DepartmentID)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and order
	offset := (filter.Page - 1) * filter.Limit
	if err := query.Order("created_at DESC").
		Offset(offset).Limit(filter.Limit).
		Find(&requests).Error; err != nil {
		return nil, 0, err
	}

	return requests, total, nil
}

func (rs *RequestService) ApproveRequest(requestID, adminID, notes string) error {
	tx := rs.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	now := time.Now()
	err := tx.Model(&models.Request{}).
		Where("id = ? AND status = ?", requestID, models.RequestStatusPending).
		Updates(map[string]interface{}{
			"status":         models.RequestStatusApproved,
			"approved_by_id": adminID,
			"approved_date":  &now,
			"admin_note":     notes,
		}).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	// Update request items status
	err = tx.Model(&models.RequestItem{}).
		Where("request_id = ?", requestID).
		Update("status", models.RequestStatusApproved).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (rs *RequestService) RejectRequest(requestID, adminID, reason string) error {
	tx := rs.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get request items to restore quantities
	var items []models.RequestItem
	if err := tx.Where("request_id = ?", requestID).Find(&items).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Restore product quantities
	for _, item := range items {
		if err := tx.Model(&models.Product{}).
			Where("id = ?", item.ProductID).
			Update("available_quantity", gorm.Expr("available_quantity + ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// Update request status
	err := tx.Model(&models.Request{}).
		Where("id = ? AND status = ?", requestID, models.RequestStatusPending).
		Updates(map[string]interface{}{
			"status":           models.RequestStatusRejected,
			"approved_by_id":   adminID,
			"rejection_reason": reason,
		}).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	// Update request items status
	err = tx.Model(&models.RequestItem{}).
		Where("request_id = ?", requestID).
		Update("status", models.RequestStatusRejected).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// Add this method to your RequestService struct
func (rs *RequestService) GetDB() *gorm.DB {
	return rs.db
}
