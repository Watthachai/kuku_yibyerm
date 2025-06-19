// services/product_service.go
package services

import (
	"errors"
	"fmt"
	"ku-asset/dto"
	"ku-asset/models"
	"math"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Interface ไม่มีการเปลี่ยนแปลง
type ProductService interface {
	GetProducts(query *dto.ProductQuery) (*dto.PaginatedProductResponse, error)
	GetProductByID(id string) (*dto.ProductResponse, error)
	CreateProduct(req *dto.CreateProductRequest) (*dto.ProductResponse, error)
	UpdateProduct(id string, req *dto.UpdateProductRequest) (*dto.ProductResponse, error)
	DeleteProduct(id string) error
	GetProductForUpdate(tx *gorm.DB, id string) (*models.Product, error)
	UpdateStock(tx *gorm.DB, id string, change int) error
}

type productService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) ProductService {
	return &productService{db: db}
}

// ... (GetProducts, GetProductByID, CreateProduct เหมือนเดิม) ...

func (s *productService) GetProducts(query *dto.ProductQuery) (*dto.PaginatedProductResponse, error) {
	var products []models.Product
	var total int64
	dbQuery := s.db.Model(&models.Product{})

	if query.CategoryID != "" {
		dbQuery = dbQuery.Where("category_id = ?", query.CategoryID)
	}
	if query.Search != "" {
		searchTerm := "%" + query.Search + "%"
		dbQuery = dbQuery.Where("name ILIKE ?", searchTerm)
	}
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (query.Page - 1) * query.Limit
	if err := dbQuery.Preload("Category").Offset(offset).Limit(query.Limit).Find(&products).Error; err != nil {
		return nil, err
	}

	var productResponses []dto.ProductResponse
	for _, p := range products {
		productResponses = append(productResponses, *mapProductToResponse(&p))
	}

	return &dto.PaginatedProductResponse{
		Products: productResponses,
		Pagination: dto.PaginationResponse{
			CurrentPage: query.Page,
			PerPage:     query.Limit,
			Total:       total,
			TotalPages:  int64(math.Ceil(float64(total) / float64(query.Limit))),
		},
	}, nil
}

func (s *productService) GetProductByID(id string) (*dto.ProductResponse, error) {
	var product models.Product
	if err := s.db.Preload("Category").First(&product, "id = ?", id).Error; err != nil {
		return nil, errors.New("product not found")
	}
	return mapProductToResponse(&product), nil
}

func (s *productService) CreateProduct(req *dto.CreateProductRequest) (*dto.ProductResponse, error) {
	product := models.Product{
		ID:          req.ID,
		Name:        req.Name,
		Description: req.Description,
		CategoryID:  req.CategoryID,
		ImageURL:    req.ImageURL,
	}
	if err := s.db.Create(&product).Error; err != nil {
		return nil, err
	}
	return s.GetProductByID(product.ID)
}

// ⭐ เติม Logic ให้ UpdateProduct
func (s *productService) UpdateProduct(id string, req *dto.UpdateProductRequest) (*dto.ProductResponse, error) {
	var product models.Product
	if err := s.db.First(&product, "id = ?", id).Error; err != nil {
		return nil, errors.New("product not found")
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.CategoryID != "" {
		product.CategoryID = req.CategoryID
	}
	if req.ImageURL != "" {
		product.ImageURL = req.ImageURL
	}

	if err := s.db.Save(&product).Error; err != nil {
		return nil, err
	}
	return s.GetProductByID(id)
}

// ⭐ เติม Logic ให้ DeleteProduct
func (s *productService) DeleteProduct(id string) error {
	// GORM จะทำการ soft delete อัตโนมัติถ้า Model มี gorm.DeletedAt
	if err := s.db.Delete(&models.Product{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}

func (s *productService) GetProductForUpdate(tx *gorm.DB, id string) (*models.Product, error) {
	var product models.Product
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *productService) UpdateStock(tx *gorm.DB, id string, change int) error {
	// This logic now needs to find the relevant ASSET and update its stock.
	// This highlights the tight coupling. For now, we'll leave a placeholder.
	// In the final design, RequestService should talk to AssetService.
	fmt.Printf("Updating stock for Product ID %s, change %d. (This should be Asset)\n", id, change)
	return nil
}

// --- Helper ---
func mapProductToResponse(p *models.Product) *dto.ProductResponse {
	res := &dto.ProductResponse{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		ImageURL:    p.ImageURL,
	}
	if p.Category.ID != "" {
		res.Category = &dto.CategoryResponse{ID: p.Category.ID, Name: p.Category.Name}
	}
	return res
}
