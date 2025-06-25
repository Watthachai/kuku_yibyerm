// dto/user_dto.go
package dto

// --- DTOs for General User Actions ---
type UpdateProfileRequest struct {
	Name         *string `json:"name" binding:"omitempty,min=2"` // เปลี่ยนเป็น optional สำหรับ PATCH
	Phone        *string `json:"phone"`
	DepartmentID *uint   `json:"department_id"`
	Avatar       *string `json:"avatar"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

type UserProfileResponse struct {
	ID           uint                    `json:"id"`
	Email        string                  `json:"email"`
	Name         string                  `json:"name"`
	Phone        *string                 `json:"phone,omitempty"`
	Role         string                  `json:"role"`
	IsActive     bool                    `json:"is_active"`
	DepartmentID *uint                   `json:"department_id"`        // ลบ omitempty เพื่อให้ส่ง null มาด้วย
	Department   *DepartmentInfoResponse `json:"department,omitempty"` // เพิ่ม Department object
	Avatar       *string                 `json:"avatar,omitempty"`
}

// DTO สำหรับข้อมูล Department ที่ส่งกลับไปใน User Profile
type DepartmentInfoResponse struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Code     string  `json:"code"`
	Type     string  `json:"type"`
	ParentID *uint   `json:"parent_id,omitempty"`
	Faculty  *string `json:"faculty,omitempty"` // ข้อมูลคณะ (ถ้าเป็นภาควิชา)
	Building *string `json:"building,omitempty"`
}

// --- DTOs for Admin Actions ---
type AdminUpdateUserRequest struct {
	Name         string `json:"name"`
	Role         string `json:"role"`
	DepartmentID *uint  `json:"department_id"`
	IsActive     *bool  `json:"is_active"`
}

type PaginationRequest struct {
	Page  int `form:"page,default=1"`
	Limit int `form:"limit,default=10"`
}

type PaginatedUserResponse struct {
	Users      []UserProfileResponse `json:"users"`
	Pagination PaginationResponse    `json:"pagination"`
}

// --- User Stats Response ---
type UserStatsResponse struct {
	TotalRequests     int `json:"total_requests"`
	PendingRequests   int `json:"pending_requests"`
	ApprovedRequests  int `json:"approved_requests"`
	RejectedRequests  int `json:"rejected_requests"`
	BorrowedItems     int `json:"borrowed_items"`
	CompletedRequests int `json:"completed_requests"`
}
