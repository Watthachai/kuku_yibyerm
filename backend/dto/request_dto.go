package dto

import "time"

// --- DTOs for Request Actions ---

type CreateRequestItemInput struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

// ⭐ เพิ่ม DTO ที่ขาดไป
type CreateRequestInput struct {
	Purpose string                   `json:"purpose" binding:"required"`
	Notes   string                   `json:"notes"`
	Items   []CreateRequestItemInput `json:"items" binding:"required,min=1"`
}

type CreateRequestRequest struct {
	Purpose string                   `json:"purpose"`
	Notes   string                   `json:"notes"`
	Items   []CreateRequestItemInput `json:"items" binding:"required,min=1"`
}

type AdminUpdateStatusRequest struct {
	Status    string `json:"status" binding:"required,oneof=APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	AdminNote string `json:"admin_note"`
}

// ⭐ เพิ่ม DTO สำหรับ UpdateRequestStatus
type UpdateRequestStatusInput struct {
	Status string `json:"status" binding:"required,oneof=APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	Notes  string `json:"notes"`
}

// --- Response DTOs ---

type RequestItemResponse struct {
	Quantity int              `json:"quantity"`
	Product  *ProductResponse `json:"product,omitempty"`
}

type RequestResponse struct {
	ID            uint      `json:"id"`
	RequestNumber string    `json:"request_number"`
	Status        string    `json:"status"`
	Purpose       string    `json:"purpose"`
	Notes         string    `json:"notes,omitempty"`
	AdminNote     string    `json:"admin_note,omitempty"`
	RequestDate   time.Time `json:"request_date"`
	CreatedAt     time.Time `json:"created_at"`

	// เพิ่ม Field ที่ขาดไปทั้งหมด
	ApprovedDate  *time.Time `json:"approved_date,omitempty"`
	IssuedDate    *time.Time `json:"issued_date,omitempty"`
	CompletedDate *time.Time `json:"completed_date,omitempty"`

	// ข้อมูล User ที่เกี่ยวข้อง
	User       *UserProfileResponse  `json:"user,omitempty"`
	ApprovedBy *UserProfileResponse  `json:"approved_by,omitempty"`
	Items      []RequestItemResponse `json:"items"`
}

type RequestQuery struct {
	Page   int    `form:"page,default=1"`
	Limit  int    `form:"limit,default=10"`
	Status string `form:"status"`
	UserID uint   `form:"user_id"`
}

type PaginatedRequestResponse struct {
	Requests   []RequestResponse  `json:"requests"`
	Pagination PaginationResponse `json:"pagination"`
}
