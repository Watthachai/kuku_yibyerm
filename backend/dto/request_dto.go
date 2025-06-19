// dto/request_dto.go
package dto

import "time"

// --- Request DTOs ---

type CreateRequestItemInput struct {
	ProductID uint `json:"product_id" binding:"required"` // ⭐️ แก้เป็น uint
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CreateRequestRequest struct {
	Purpose string                   `json:"purpose"`
	Notes   string                   `json:"notes"`
	Items   []CreateRequestItemInput `json:"items" binding:"required,min=1"`
}

type AdminUpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	Notes  string `json:"notes"`
}

// --- Response DTOs ---

type RequestItemResponse struct {
	Quantity int              `json:"quantity"`
	Product  *ProductResponse `json:"product,omitempty"`
}

type RequestResponse struct {
	ID            uint                  `json:"id"` // ⭐️ แก้เป็น uint
	RequestNumber string                `json:"request_number"`
	Status        string                `json:"status"`
	Purpose       string                `json:"purpose"`
	RequestDate   time.Time             `json:"request_date"`
	User          *UserProfileResponse  `json:"user,omitempty"`
	Items         []RequestItemResponse `json:"items"`
}
