// dto/request_dto.go
package dto

import "time"

type CreateRequestItemInput struct {
	ProductID uint `json:"product_id" binding:"required"` // ⭐️ แก้จาก AssetID เป็น ProductID
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CreateRequestRequest struct {
	Purpose string                   `json:"purpose"` // ⭐️ เพิ่ม Purpose
	Notes   string                   `json:"notes"`   // ⭐️ แก้จาก RequestNote เป็น Notes
	Items   []CreateRequestItemInput `json:"items" binding:"required,min=1"`
}

type AdminUpdateStatusRequest struct {
	Status    string `json:"status" binding:"required,oneof=APPROVED REJECTED ISSUED COMPLETED CANCELLED"`
	AdminNote string `json:"admin_note"` // ⭐️ ใช้ AdminNote ให้ตรงกับ Service
}

// --- Response DTOs ---

type RequestItemResponse struct {
	Quantity int              `json:"quantity"`
	Product  *ProductResponse `json:"product,omitempty"`
}

type RequestResponse struct {
	ID        uint                  `json:"id"`
	Status    string                `json:"status"`
	CreatedAt time.Time             `json:"created_at"`
	User      *UserProfileResponse  `json:"user,omitempty"`
	Items     []RequestItemResponse `json:"items"`

	// ⭐️ เพิ่ม Field ที่ขาดไปเพื่อให้ Service ทำงานได้
	RequestNumber string    `json:"request_number"`
	Purpose       string    `json:"purpose"`
	RequestDate   time.Time `json:"request_date"`
	AdminNote     string    `json:"admin_note,omitempty"`
}

// --- ⭐ เพิ่ม Struct ใหม่ที่นี่ ---
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
