// dto/product_dto.go
package dto

// DTOs for Product domain

type ProductQuery struct {
	Page       int    `form:"page,default=1"`
	Limit      int    `form:"limit,default=20"`
	CategoryID string `form:"category_id"`
	Search     string `form:"search"`
}

type CreateProductRequest struct {
	ID          string `json:"id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	CategoryID  string `json:"category_id" binding:"required"`
	ImageURL    string `json:"image_url"`
}

type UpdateProductRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	CategoryID  string `json:"category_id"`
	ImageURL    string `json:"image_url"`
}

type ProductResponse struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	ImageURL    string            `json:"image_url"`
	Category    *CategoryResponse `json:"category,omitempty"`
}

type PaginatedProductResponse struct {
	Products   []ProductResponse  `json:"products"`
	Pagination PaginationResponse `json:"pagination"`
}
