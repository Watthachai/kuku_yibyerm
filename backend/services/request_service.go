// services/request_service.go
package services

import (
	"errors"
	"ku-asset/dto"
	"ku-asset/models"
	"time"

	"gorm.io/gorm"
)

type RequestService interface {
	CreateRequest(userID uint, req *dto.CreateRequestRequest) (*dto.RequestResponse, error)
	GetRequestByID(requestID uint, userID uint, userRole models.Role) (*dto.RequestResponse, error)
	UpdateRequestStatus(requestID uint, adminID uint, req *dto.AdminUpdateStatusRequest) (*dto.RequestResponse, error)
	GetAllRequests(query *dto.RequestQuery) (*dto.PaginatedRequestResponse, error)
}

type requestService struct {
	db           *gorm.DB
	assetService AssetService
}

func NewRequestService(db *gorm.DB, assetService AssetService) RequestService {
	return &requestService{db: db, assetService: assetService}
}

func (s *requestService) CreateRequest(userID uint, req *dto.CreateRequestRequest) (*dto.RequestResponse, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	request := models.Request{
		UserID:      userID,
		Purpose:     req.Purpose, // ⭐️ แก้ไขแล้ว
		Notes:       req.Notes,   // ⭐️ แก้ไขแล้ว
		Status:      models.RequestStatusPending,
		RequestDate: time.Now(),
	}
	if err := tx.Create(&request).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, item := range req.Items {
		requestItem := models.RequestItem{RequestID: request.ID, ProductID: item.ProductID, Quantity: item.Quantity} // ⭐️ แก้ไขแล้ว
		if err := tx.Create(&requestItem).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return s.GetRequestByID(request.ID, userID, models.RoleAdmin)
}

func (s *requestService) UpdateRequestStatus(requestID uint, adminID uint, req *dto.AdminUpdateStatusRequest) (*dto.RequestResponse, error) {
	var request models.Request
	if err := s.db.First(&request, requestID).Error; err != nil {
		return nil, errors.New("request not found")
	}

	reqStatus := models.RequestStatus(req.Status)
	request.Status = reqStatus
	request.AdminNote = req.AdminNote // ⭐️ แก้ไขแล้ว
	if reqStatus == models.RequestStatusApproved {
		now := time.Now()
		request.ApprovedByID = &adminID
		request.ApprovedDate = &now
	}
	if err := s.db.Save(&request).Error; err != nil {
		return nil, err
	}

	return s.GetRequestByID(requestID, adminID, models.RoleAdmin)
}

func (s *requestService) GetRequestByID(requestID uint, userID uint, userRole models.Role) (*dto.RequestResponse, error) {
	var request models.Request
	query := s.db.Preload("User").Preload("Items.Product")
	if userRole != models.RoleAdmin {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&request, requestID).Error; err != nil {
		return nil, errors.New("request not found")
	}
	return mapRequestToResponse(&request), nil
}

func (s *requestService) GetAllRequests(query *dto.RequestQuery) (*dto.PaginatedRequestResponse, error) {
	// Placeholder - implement logic here later
	return nil, nil
}

// ⭐ แก้ไข Helper function ให้สมบูรณ์
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

	return &dto.RequestResponse{
		ID:            r.ID,
		RequestNumber: r.RequestNumber,
		Status:        string(r.Status),
		Purpose:       r.Purpose,
		RequestDate:   r.RequestDate,
		AdminNote:     r.AdminNote,
		User:          userDto,
		Items:         itemResponses,
	}
}
