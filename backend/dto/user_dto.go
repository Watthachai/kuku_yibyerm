// dto/user_dto.go
package dto

// --- DTOs for General User Actions ---
type UpdateProfileRequest struct {
	Name   string  `json:"name" binding:"required,min=2"`
	Avatar *string `json:"avatar"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

type UserProfileResponse struct {
	ID           uint    `json:"id"`
	Email        string  `json:"email"`
	Name         string  `json:"name"`
	Role         string  `json:"role"`
	IsActive     bool    `json:"is_active"`
	DepartmentID *uint   `json:"department_id,omitempty"`
	Avatar       *string `json:"avatar,omitempty"`
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
