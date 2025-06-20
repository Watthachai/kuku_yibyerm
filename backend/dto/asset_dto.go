package dto

import (
	"mime/multipart"
	"time"
)

type CreateAssetRequest struct {
	AssetCode        string                `form:"asset_code" binding:"required"`
	Status           string                `form:"status" binding:"required"`
	LocationBuilding string                `form:"location_building" binding:"required"`
	LocationRoom     string                `form:"location_room" binding:"required"`
	ProductID        uint                  `form:"product_id" binding:"required"`
	SerialNumber     string                `form:"serial_number"`
	Notes            string                `form:"notes"`
	PurchaseDate     string                `form:"purchase_date"`
	PurchasePrice    float64               `form:"purchase_price"`
	Image            *multipart.FileHeader `form:"image"`
}

// ⭐ แก้ไข AssetResponse ให้มีโครงสร้างตรงกับที่ Frontend ต้องการ
type AssetResponse struct {
	ID               uint      `json:"id"`
	AssetCode        string    `json:"assetCode"`
	Status           string    `json:"status"`
	Name             string    `json:"name"`
	SerialNumber     *string   `json:"serialNumber,omitempty"`
	Quantity         int       `json:"quantity"`
	ImageURL         *string   `json:"imageUrl"`
	LocationBuilding string    `json:"locationBuilding"`
	LocationRoom     string    `json:"locationRoom"`
	CreatedAt        time.Time `json:"createdAt"`

	// ย้าย Category และ Department มาไว้ระดับบนสุด
	Category   *CategoryResponse   `json:"category,omitempty"`
	Department *DepartmentResponse `json:"department,omitempty"`
}

type AssetQuery struct {
	Page      int    `form:"page,default=1"`
	Limit     int    `form:"limit,default=20"`
	Status    string `form:"status"`
	ProductID uint   `form:"product_id"`
	Search    string `form:"search"`
}

type PaginatedAssetResponse struct {
	Assets     []AssetResponse    `json:"assets"`
	Pagination PaginationResponse `json:"pagination"`
}
