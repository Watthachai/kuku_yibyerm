// dto/department_dto.go
package dto

import "time"

// --- Request DTOs ---

type DepartmentQuery struct {
	Type    string `form:"type"`    // FACULTY, INSTITUTE, OFFICE
	Include string `form:"include"` // hierarchy
}

type CreateDepartmentRequest struct {
	Code     string `json:"code" binding:"required"`
	NameTh   string `json:"name_th" binding:"required"`
	NameEn   string `json:"name_en"`
	Type     string `json:"type" binding:"required,oneof=FACULTY INSTITUTE OFFICE"`
	ParentID *uint  `json:"parent_id"`
	IsActive bool   `json:"is_active"`
}

type UpdateDepartmentRequest struct {
	Code     string `json:"code"`
	NameTh   string `json:"name_th"`
	NameEn   string `json:"name_en"`
	Type     string `json:"type"`
	ParentID *uint  `json:"parent_id"`
	IsActive *bool  `json:"is_active"`
}

// --- Response DTOs ---

type DepartmentResponse struct {
	ID        uint                 `json:"id"`
	Code      string               `json:"code"`
	NameTh    string               `json:"name_th"`
	NameEn    string               `json:"name_en"`
	Type      string               `json:"type"`
	ParentID  *uint                `json:"parent_id"`
	Parent    *DepartmentResponse  `json:"parent,omitempty"`
	Children  []DepartmentResponse `json:"children,omitempty"`
	IsActive  bool                 `json:"is_active"`
	CreatedAt time.Time            `json:"created_at"`
	UpdatedAt time.Time            `json:"updated_at"`
}

type PaginatedDepartmentResponse struct {
	Departments []DepartmentResponse `json:"departments"`
	Pagination  PaginationResponse   `json:"pagination"`
}
