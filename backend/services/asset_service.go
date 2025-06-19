// services/asset_service.go
package services

import (
	"ku-asset/dto"
	"ku-asset/models"

	"gorm.io/gorm"
)

type AssetService interface {
	CreateAsset(req *dto.CreateAssetRequest) (*dto.AssetResponse, error)
	// เพิ่ม Method อื่นๆ ที่จำเป็น
}

type assetService struct {
	db *gorm.DB
}

func NewAssetService(db *gorm.DB) AssetService {
	return &assetService{db: db}
}

func (s *assetService) CreateAsset(req *dto.CreateAssetRequest) (*dto.AssetResponse, error) {
	// Add logic for file upload here...
	// For now, we'll use a placeholder URL.
	var imageURL *string
	if req.Image != nil {
		temp := "path/to/your/image.jpg"
		imageURL = &temp
	}

	asset := models.Asset{
		ProductID:        req.ProductID,
		AssetCode:        req.AssetCode,
		SerialNumber:     &req.SerialNumber,
		Status:           req.Status,
		LocationBuilding: req.LocationBuilding,
		LocationRoom:     req.LocationRoom,
		ImageURL:         imageURL,
	}

	if err := s.db.Create(&asset).Error; err != nil {
		return nil, err
	}

	// Re-fetch to preload product info for the response
	s.db.Preload("Product").First(&asset, asset.ID)

	response := &dto.AssetResponse{
		ID:               asset.ID,
		AssetCode:        asset.AssetCode,
		Status:           asset.Status,
		LocationBuilding: asset.LocationBuilding,
		LocationRoom:     asset.LocationRoom,
		ImageURL:         asset.ImageURL,
		CreatedAt:        asset.CreatedAt,
		Product: &dto.ProductResponse{
			ID:   asset.Product.ID,
			Name: asset.Product.Name,
		},
	}

	return response, nil
}
