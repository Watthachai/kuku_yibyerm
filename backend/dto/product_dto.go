// dto/product_dto.go
package dto

import "time"

// DTOs for Product domain

type ProductQuery struct {
	Page       int    `form:"page,default=1"`
	Limit      int    `form:"limit,default=20"`
	Search     string `form:"search"`
	CategoryID string `form:"category_id"`
}

type CreateProductRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	CategoryID   uint   `json:"category_id" binding:"required"`
	Brand        string `json:"brand"`
	ProductModel string `json:"product_model"`

	// Stock fields
	Stock    int    `json:"stock" binding:"required,min=0"` // จำนวนเริ่มต้น
	MinStock int    `json:"min_stock" binding:"min=0"`      // จำนวนขั้นต่ำ
	Unit     string `json:"unit"`                           // หน่วยนับ

	// ⭐ เพิ่ม ImageURL field (optional)
	ImageURL *string `json:"image_url"`
}

// UpdateProductRequest defines the request body for updating a product.
type UpdateProductRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	CategoryID   uint   `json:"category_id"`
	Brand        string `json:"brand"`
	ProductModel string `json:"product_model"`
	Stock        int    `json:"stock"` // ⭐ ใช้ stock แทน quantity
	MinStock     int    `json:"min_stock"`
	Unit         string `json:"unit"`

	// ⭐ เพิ่ม ImageURL field
	ImageURL *string `json:"image_url"`
}

// ProductResponse is the standard representation of a product returned by the API.
type ProductResponse struct {
	ID           uint   `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Brand        string `json:"brand"`
	ProductModel string `json:"product_model"`

	// Stock fields
	Stock    int    `json:"stock"`     // จำนวนคงเหลือ
	MinStock int    `json:"min_stock"` // จำนวนขั้นต่ำ
	Unit     string `json:"unit"`      // หน่วยนับ
	Status   string `json:"status"`

	// ⭐ เพิ่ม ImageURL field
	ImageURL *string `json:"image_url"`

	Category  *CategoryResponse `json:"category,omitempty"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}

type PaginatedProductResponse struct {
	Products   []ProductResponse  `json:"products"`
	Pagination PaginationResponse `json:"pagination"`
}
