// dto/product_dto.go
package dto

// DTOs for Product domain

type ProductQuery struct {
	Page       int    `form:"page,default=1"`
	Limit      int    `form:"limit,default=20"`
	CategoryID string `form:"category_id"`
	Search     string `form:"search"`
}

// DTO สำหรับรับข้อมูลตอนสร้าง Product ใหม่
type CreateProductRequest struct {
	Name           string `json:"name" binding:"required"`
	Description    string `json:"description"`
	Brand          string `json:"brand"`
	ProductModel   string `json:"productModel"`
	CategoryID     uint   `json:"category_id" binding:"required"`
	TrackingMethod string `json:"trackingMethod" binding:"required,oneof=BY_ITEM BY_QUANTITY"`
}

// DTO สำหรับส่งข้อมูล Product กลับไปให้ Frontend
type ProductResponse struct {
	ID             uint              `json:"id"`
	Name           string            `json:"name"`
	Description    string            `json:"description"` // ⭐ เพิ่ม Field นี้
	ImageURL       *string           `json:"imageUrl"`    // ⭐ แก้เป็น *string
	Brand          *string           `json:"brand,omitempty"`
	ProductModel   *string           `json:"productModel,omitempty"`
	TrackingMethod string            `json:"trackingMethod"`
	Category       *CategoryResponse `json:"category,omitempty"`
}

type UpdateProductRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	CategoryID  uint   `json:"category_id"`
	ImageURL    string `json:"image_url"`
}

type PaginatedProductResponse struct {
	Products   []ProductResponse  `json:"products"`
	Pagination PaginationResponse `json:"pagination"`
}
