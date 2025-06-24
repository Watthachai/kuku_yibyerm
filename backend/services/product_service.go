package services

import (
	"fmt"
	"ku-asset/dto"
	"ku-asset/models"
	"math"

	"gorm.io/gorm"
)

type ProductService interface {
	GetProducts(query *dto.ProductQuery) (*dto.PaginatedProductResponse, error)
	GetProductByID(id uint) (*dto.ProductResponse, error)
	CreateProduct(req *dto.CreateProductRequest) (*dto.ProductResponse, error)
	UpdateProduct(id uint, req *dto.UpdateProductRequest) (*dto.ProductResponse, error)
	DeleteProduct(id uint) error
	UpdateStock(tx *gorm.DB, productID uint, quantityChange int) error
}

type productService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) ProductService {
	return &productService{db: db}
}

func (s *productService) CreateProduct(req *dto.CreateProductRequest) (*dto.ProductResponse, error) {
	// สร้าง Code อัตโนมัติ
	code, err := s.generateProductCode()
	if err != nil {
		return nil, err
	}

	product := models.Product{
		Code:         code,
		Name:         req.Name,
		Description:  req.Description,
		CategoryID:   req.CategoryID,
		Brand:        req.Brand,
		ProductModel: req.ProductModel,

		// Stock fields
		Stock:    req.Stock,
		MinStock: req.MinStock,
		Unit:     req.Unit,
		Status:   models.ProductStatusActive,

		// ⭐ เพิ่ม ImageURL
		ImageURL: req.ImageURL,
	}

	// ตั้งค่า default unit
	if product.Unit == "" {
		product.Unit = "ชิ้น"
	}

	if err := s.db.Create(&product).Error; err != nil {
		return nil, err
	}

	// โหลดข้อมูลใหม่พร้อม relations
	if err := s.db.Preload("Category").First(&product, product.ID).Error; err != nil {
		return nil, err
	}

	return mapProductToResponse(&product), nil
}

func (s *productService) GetProductByID(id uint) (*dto.ProductResponse, error) {
	var product models.Product
	if err := s.db.Preload("Category").First(&product, id).Error; err != nil {
		return nil, err
	}
	return mapProductToResponse(&product), nil
}

// ⭐ เติม Logic ให้ GetProducts
func (s *productService) GetProducts(query *dto.ProductQuery) (*dto.PaginatedProductResponse, error) {
	var products []models.Product
	var total int64
	dbQuery := s.db.Model(&models.Product{})

	// Apply filters
	if query.CategoryID != "" {
		dbQuery = dbQuery.Where("category_id = ?", query.CategoryID)
	}
	if query.Search != "" {
		searchTerm := "%" + query.Search + "%"
		dbQuery = dbQuery.Where("name ILIKE ?", searchTerm)
	}

	// Get total count
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, err
	}

	// Apply pagination and get results
	offset := (query.Page - 1) * query.Limit
	if err := dbQuery.Preload("Category").Offset(offset).Limit(query.Limit).Find(&products).Error; err != nil {
		return nil, err
	}

	// Map to response
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

func (s *productService) UpdateProduct(id uint, req *dto.UpdateProductRequest) (*dto.ProductResponse, error) {
	var product models.Product
	if err := s.db.First(&product, id).Error; err != nil {
		return nil, err
	}

	// อัปเดตเฉพาะ field ที่มีค่า
	if req.Name != "" {
		product.Name = req.Name
	}
	if req.Description != "" {
		product.Description = req.Description
	}
	if req.Brand != "" {
		product.Brand = req.Brand
	}
	if req.ProductModel != "" {
		product.ProductModel = req.ProductModel
	}
	if req.Stock >= 0 {
		product.Stock = req.Stock
	}
	if req.MinStock >= 0 {
		product.MinStock = req.MinStock
	}
	if req.Unit != "" {
		product.Unit = req.Unit
	}
	if req.CategoryID > 0 {
		product.CategoryID = req.CategoryID
	}

	// ⭐ อัปเดต ImageURL (รวมถึงการลบรูป)
	if req.ImageURL != nil {
		product.ImageURL = req.ImageURL
	}

	if err := s.db.Save(&product).Error; err != nil {
		return nil, err
	}

	// โหลดข้อมูลใหม่
	if err := s.db.Preload("Category").First(&product, product.ID).Error; err != nil {
		return nil, err
	}

	return mapProductToResponse(&product), nil
}

func (s *productService) DeleteProduct(id uint) error {
	return s.db.Delete(&models.Product{}, id).Error
}

func (s *productService) UpdateStock(tx *gorm.DB, productID uint, quantityChange int) error {
	// ใช้ gorm.Expr เพื่อบวกลบค่าใน database โดยตรงอย่างปลอดภัย
	// quantityChange สามารถเป็นได้ทั้งค่าบวก (เติมสต็อก) และค่าลบ (เบิกของ)
	return tx.Model(&models.Product{}).
		Where("id = ?", productID).
		Update("quantity", gorm.Expr("quantity + ?", quantityChange)).Error
}

// ⭐ สร้าง Product Code อัตโนมัติ
func (s *productService) generateProductCode() (string, error) {
	var count int64
	if err := s.db.Model(&models.Product{}).Count(&count).Error; err != nil {
		return "", err
	}

	// สร้าง code ใหม่
	nextID := count + 1
	return fmt.Sprintf("PRD%04d", nextID), nil
}

// ⭐ อัปเดต mapProductToResponse
func mapProductToResponse(p *models.Product) *dto.ProductResponse {
	res := &dto.ProductResponse{
		ID:           p.ID,
		Code:         p.Code,
		Name:         p.Name,
		Description:  p.Description,
		Brand:        p.Brand,
		ProductModel: p.ProductModel,
		Stock:        p.Stock,
		MinStock:     p.MinStock,
		Unit:         p.Unit,
		Status:       string(p.Status),

		// ⭐ เพิ่ม ImageURL
		ImageURL: p.ImageURL,

		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}

	if p.Category.ID != 0 {
		res.Category = &dto.CategoryResponse{
			ID:   p.Category.ID,
			Name: p.Category.Name,
		}
	}

	return res
}
