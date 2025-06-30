package dto

import "time"

// --- Request DTOs ---

type CreateRequestItemInput struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CreateRequestInput struct {
	Purpose string                   `json:"purpose" binding:"required"`
	Notes   string                   `json:"notes"`
	Items   []CreateRequestItemInput `json:"items" binding:"required,min=1"`
}

type UpdateRequestStatusInput struct {
	Status string `json:"status" binding:"required,oneof=PENDING APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	Notes  string `json:"notes"`
}

type AdminUpdateStatusRequest struct {
	Status    string `json:"status" binding:"required,oneof=APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	AdminNote string `json:"admin_note"`
}

type RequestQuery struct {
	Page   int    `form:"page,default=1"`
	Limit  int    `form:"limit,default=10"`
	Status string `form:"status"`
	UserID uint   `form:"user_id"`
}

// --- Response DTOs ---

type RequestItemResponse struct {
	ID        uint            `json:"id"`
	ProductID uint            `json:"product_id"`
	Product   ProductResponse `json:"product"`
	Quantity  int             `json:"quantity"`
}

type RequestResponse struct {
	ID            uint                  `json:"id"`
	RequestNumber string                `json:"request_number"`
	UserID        uint                  `json:"user_id"`
	User          *UserProfileResponse  `json:"user,omitempty"`
	Purpose       string                `json:"purpose"`
	Notes         string                `json:"notes"`
	Status        string                `json:"status"`
	AdminNote     string                `json:"admin_note"`
	RequestDate   time.Time             `json:"request_date"`
	ApprovedDate  *time.Time            `json:"approved_date,omitempty"`
	IssuedDate    *time.Time            `json:"issued_date,omitempty"`
	CompletedDate *time.Time            `json:"completed_date,omitempty"`
	ApprovedBy    *UserProfileResponse  `json:"approved_by,omitempty"`
	Items         []RequestItemResponse `json:"items"`
	CreatedAt     time.Time             `json:"created_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
}

type PaginatedRequestResponse struct {
	Requests   []RequestResponse  `json:"requests"`
	Pagination PaginationResponse `json:"pagination"`
}
