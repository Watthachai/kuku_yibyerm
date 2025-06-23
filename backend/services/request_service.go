package services

import (
	"errors"
	"fmt"
	"ku-asset/dto"
	"ku-asset/models"
	"log"
	"time"

	"gorm.io/gorm"
)

// ⭐ อัปเดต Interface ให้ตรงกับที่ Controller เรียกใช้
type RequestService interface {
	CreateRequest(userID uint, input *dto.CreateRequestInput) (*dto.RequestResponse, error)
	GetRequestsByUserID(userID uint) ([]dto.RequestResponse, error)
	GetRequestByID(requestID uint) (*dto.RequestResponse, error)
	GetAllRequests() ([]dto.RequestResponse, error)
	UpdateRequestStatus(requestID uint, status string, notes string) (*dto.RequestResponse, error)
}

type requestService struct {
	db             *gorm.DB
	productService ProductService
}

func NewRequestService(db *gorm.DB, productService ProductService) RequestService {
	return &requestService{db: db, productService: productService}
}

// ApproveRequest คือ Flow ที่ Admin ทำ
func (s *requestService) ApproveRequest(requestID uint, adminID uint) (*models.Request, error) {
	// ใช้ Transaction เพื่อให้แน่ใจว่าถ้ามีอะไรผิดพลาด จะไม่เกิดการตัดสต็อกฟรี
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.Request
	if err := tx.First(&request, requestID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("request not found")
	}

	// ดึงรายการของในคำขอ
	var items []models.RequestItem
	if err := tx.Where("request_id = ?", requestID).Find(&items).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// วนลูปเพื่อตัดสต็อกสินค้าแต่ละรายการ
	for _, item := range items {
		// เรียกใช้ ProductService เพื่อลดจำนวน Quantity
		if err := s.productService.UpdateStock(tx, item.ProductID, -item.Quantity); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// อัปเดตสถานะคำขอ
	request.Status = models.RequestStatusApproved // หรือ COMPLETED ตาม Flow ที่ต้องการ
	request.ApprovedByID = &adminID
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	return &request, tx.Commit().Error
}

// ⭐ เพิ่ม function สำหรับสร้าง Request Number
func (s *requestService) generateRequestNumber() (string, error) {
	now := time.Now()
	prefix := now.Format("REQ20060102") // REQ20250623

	// หาลำดับสุดท้ายของวันนี้
	var count int64
	datePattern := prefix + "%"

	if err := s.db.Model(&models.Request{}).
		Where("request_number LIKE ?", datePattern).
		Count(&count).Error; err != nil {
		return "", err
	}

	// สร้าง request number ใหม่
	sequence := count + 1
	return fmt.Sprintf("%s%03d", prefix, sequence), nil
}

// ⭐ อัปเดต CreateRequest ให้สร้าง Request Number
func (s *requestService) CreateRequest(userID uint, req *dto.CreateRequestInput) (*dto.RequestResponse, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// ⭐ สร้าง Request Number
	requestNumber, err := s.generateRequestNumber()
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to generate request number: %v", err)
	}

	request := models.Request{
		RequestNumber: requestNumber, // ⭐ เพิ่ม Request Number
		UserID:        userID,
		Purpose:       req.Purpose,
		Notes:         req.Notes,
		Status:        models.RequestStatusPending,
		RequestDate:   time.Now(),
	}

	if err := tx.Create(&request).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// สร้าง Request Items
	for _, item := range req.Items {
		requestItem := models.RequestItem{
			RequestID: request.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		}
		if err := tx.Create(&requestItem).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create request item: %v", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// โหลดข้อมูลใหม่พร้อม relations
	var createdRequest models.Request
	if err := s.db.Preload("User").Preload("Items.Product.Category").First(&createdRequest, request.ID).Error; err != nil {
		return nil, err
	}

	return mapRequestToResponse(&createdRequest), nil
}

// ⭐ เพิ่ม GetRequestsByUserID
func (s *requestService) GetRequestsByUserID(userID uint) ([]dto.RequestResponse, error) {
	var requests []models.Request
	if err := s.db.Preload("User").Preload("Items.Product.Category").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}

	var responses []dto.RequestResponse
	for _, req := range requests {
		responses = append(responses, *mapRequestToResponse(&req))
	}

	return responses, nil
}

// ⭐ แก้ไข GetRequestByID ให้เป็น single version
func (s *requestService) GetRequestByID(requestID uint) (*dto.RequestResponse, error) {
	var request models.Request
	if err := s.db.Preload("User").Preload("Items.Product.Category").First(&request, requestID).Error; err != nil {
		return nil, errors.New("request not found")
	}
	return mapRequestToResponse(&request), nil
}

// ⭐ เพิ่ม GetAllRequests
func (s *requestService) GetAllRequests() ([]dto.RequestResponse, error) {
	var requests []models.Request
	if err := s.db.Preload("User").Preload("Items.Product.Category").
		Order("created_at DESC").
		Find(&requests).Error; err != nil {
		return nil, err
	}

	var responses []dto.RequestResponse
	for _, req := range requests {
		responses = append(responses, *mapRequestToResponse(&req))
	}

	return responses, nil
}

// ⭐ แก้ไข UpdateRequestStatus
func (s *requestService) UpdateRequestStatus(requestID uint, status string, notes string) (*dto.RequestResponse, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// อัปเดตสถานะคำขอ
	var request models.Request
	if err := tx.First(&request, requestID).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	request.Status = models.RequestStatus(status)
	request.AdminNote = notes

	// เซ็ตวันที่ตามสถานะ
	now := time.Now()
	switch status {
	case "APPROVED":
		request.ApprovedDate = &now
		// ⭐ ลดสินค้าในคลังเมื่ออนุมัติ
		if err := s.reduceProductStock(tx, requestID); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to reduce stock: %v", err)
		}
	case "ISSUED":
		request.IssuedDate = &now
	case "COMPLETED":
		request.CompletedDate = &now
	}

	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// โหลดข้อมูลใหม่
	var updatedRequest models.Request
	if err := s.db.Preload("User").Preload("Items.Product.Category").First(&updatedRequest, requestID).Error; err != nil {
		return nil, err
	}

	return mapRequestToResponse(&updatedRequest), nil
}

// ⭐ ลดสต็อกเมื่ออนุมัติ
func (s *requestService) reduceProductStock(tx *gorm.DB, requestID uint) error {
	var items []models.RequestItem
	if err := tx.Where("request_id = ?", requestID).Preload("Product").Find(&items).Error; err != nil {
		return err
	}

	for _, item := range items {
		var product models.Product
		if err := tx.First(&product, item.ProductID).Error; err != nil {
			return fmt.Errorf("product not found: %v", err)
		}

		// ⭐ ตรวจสอบสต็อก
		if product.Stock < item.Quantity {
			return fmt.Errorf("insufficient stock for product %s: available %d, requested %d",
				product.Name, product.Stock, item.Quantity)
		}

		// ⭐ ลดสต็อก
		newStock := product.Stock - item.Quantity
		if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
			return fmt.Errorf("failed to update stock for product %s: %v", product.Name, err)
		}

		log.Printf("✅ Reduced stock for %s: %d -> %d (requested: %d)",
			product.Name, product.Stock, newStock, item.Quantity)

		// ⭐ แจ้งเตือนสต็อกต่ำ
		if newStock <= product.MinStock {
			log.Printf("⚠️ Low stock alert: %s (remaining: %d, min: %d)",
				product.Name, newStock, product.MinStock)
		}

		// ⭐ อัปเดตสถานะเมื่อหมดสต็อก
		if newStock == 0 {
			if err := tx.Model(&product).Update("status", models.ProductStatusOutOfStock).Error; err != nil {
				log.Printf("Failed to update product status: %v", err)
			}
		}
	}

	return nil
}

// ⭐ Helper function
func mapRequestToResponse(r *models.Request) *dto.RequestResponse {
	userDto := &dto.UserProfileResponse{
		ID:    r.User.ID,
		Name:  r.User.Name,
		Email: r.User.Email,
	}

	var itemResponses []dto.RequestItemResponse
	for _, item := range r.Items {
		itemResponses = append(itemResponses, dto.RequestItemResponse{
			Quantity: item.Quantity,
			Product: &dto.ProductResponse{
				ID:   item.Product.ID,
				Name: item.Product.Name,
			},
		})
	}

	res := &dto.RequestResponse{
		ID:            r.ID,
		RequestNumber: r.RequestNumber,
		Status:        string(r.Status),
		Purpose:       r.Purpose,
		Notes:         r.Notes,
		RequestDate:   r.RequestDate,
		AdminNote:     r.AdminNote,
		User:          userDto,
		Items:         itemResponses,
		CreatedAt:     r.CreatedAt,
	}

	if r.ApprovedDate != nil {
		res.ApprovedDate = r.ApprovedDate
	}

	return res
}
