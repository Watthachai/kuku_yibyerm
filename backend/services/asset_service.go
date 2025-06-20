package services

import (
	"ku-asset/dto"
	"ku-asset/models"
	"math"

	"gorm.io/gorm"
)

type AssetService interface {
	CreateAsset(req *dto.CreateAssetRequest) (*dto.AssetResponse, error)
	GetAssets(query *dto.AssetQuery) (*dto.PaginatedAssetResponse, error)
}

type assetService struct {
	db *gorm.DB
}

func NewAssetService(db *gorm.DB) AssetService {
	return &assetService{db: db}
}

func (s *assetService) GetAssets(query *dto.AssetQuery) (*dto.PaginatedAssetResponse, error) {
	var assets []models.Asset
	var total int64
	dbQuery := s.db.Model(&models.Asset{})

	if query.Status != "" {
		dbQuery = dbQuery.Where("status = ?", query.Status)
	}
	if query.ProductID != 0 {
		dbQuery = dbQuery.Where("product_id = ?", query.ProductID)
	}
	if query.Search != "" {
		searchTerm := "%" + query.Search + "%"
		dbQuery = dbQuery.Where("asset_code ILIKE ? OR serial_number ILIKE ?", searchTerm, searchTerm)
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (query.Page - 1) * query.Limit
	err := dbQuery.Preload("Product.Category").Preload("Department").
		Offset(offset).Limit(query.Limit).Order("id desc").Find(&assets).Error
	if err != nil {
		return nil, err
	}

	var assetResponses []dto.AssetResponse
	for _, asset := range assets {
		assetResponses = append(assetResponses, *mapAssetToResponse(&asset))
	}

	return &dto.PaginatedAssetResponse{
		Assets: assetResponses,
		Pagination: dto.PaginationResponse{
			CurrentPage: query.Page, PerPage: query.Limit, Total: total,
			TotalPages: int64(math.Ceil(float64(total) / float64(query.Limit))),
		},
	}, nil
}

func (s *assetService) CreateAsset(req *dto.CreateAssetRequest) (*dto.AssetResponse, error) {
	var imageURL *string
	// ... Your file upload logic here ...
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

	s.db.Preload("Product.Category").Preload("Department").First(&asset, asset.ID)
	return mapAssetToResponse(&asset), nil
}

// ⭐ แก้ไข Helper function นี้เป็นครั้งสุดท้ายจริงๆ
func mapAssetToResponse(asset *models.Asset) *dto.AssetResponse {
	res := &dto.AssetResponse{
		ID:               asset.ID,
		AssetCode:        asset.AssetCode,
		Status:           asset.Status,
		LocationBuilding: asset.LocationBuilding,
		LocationRoom:     asset.LocationRoom,
		ImageURL:         asset.ImageURL,
		CreatedAt:        asset.CreatedAt,
		SerialNumber:     asset.SerialNumber,
		Quantity:         asset.Quantity,
	}

	if asset.Product.ID != 0 {
		res.Name = asset.Product.Name
		if asset.Product.Category.ID != 0 {
			res.Category = &dto.CategoryResponse{
				ID:   asset.Product.Category.ID,
				Name: asset.Product.Category.Name,
			}
		}
	}

	if asset.DepartmentID != nil {
		res.Department = &dto.DepartmentResponse{
			ID:     *asset.DepartmentID,
			NameTH: asset.Department.NameTH,
		}
	}
	return res
}
