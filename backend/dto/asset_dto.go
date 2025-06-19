// dto/asset_dto.go
package dto

import (
	"mime/multipart"
	"time"
)

// --- Struct เดิม ---
type CreateAssetRequest struct {
	Name             string                `form:"name" binding:"required"`
	AssetCode        string                `form:"asset_code" binding:"required"`
	Status           string                `form:"status" binding:"required"`
	LocationBuilding string                `form:"location_building" binding:"required"`
	LocationRoom     string                `form:"location_room" binding:"required"`
	PurchaseDate     string                `form:"purchase_date"`
	Image            *multipart.FileHeader `form:"image"`
	ProductID        uint                  `form:"product_id" binding:"required"`
	SerialNumber     string                `form:"serial_number"`
}

type AssetResponse struct {
	ID               uint             `json:"id"`
	AssetCode        string           `json:"asset_code"`
	Status           string           `json:"status"`
	LocationBuilding string           `json:"location_building"`
	LocationRoom     string           `json:"location_room"`
	ImageURL         *string          `json:"image_url"`
	CreatedAt        time.Time        `json:"created_at"`
	Product          *ProductResponse `json:"product,omitempty"`
}

// --- ⭐ เพิ่ม Struct ใหม่ที่นี่ ---
type AssetQuery struct {
	Page      int    `form:"page,default=1"`
	Limit     int    `form:"limit,default=20"`
	Status    string `form:"status"`
	ProductID uint   `form:"product_id"`
}

type PaginatedAssetResponse struct {
	Assets     []AssetResponse    `json:"assets"`
	Pagination PaginationResponse `json:"pagination"`
}
