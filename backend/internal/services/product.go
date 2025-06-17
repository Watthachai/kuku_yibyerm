package services

import (
	"ku-asset/internal/models"

	"gorm.io/gorm"
)

type ProductService struct {
	db *gorm.DB
}

type ProductFilter struct {
	CategoryID   string
	Search       string
	Status       string
	DepartmentID string
	Page         int
	Limit        int
}

func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{db: db}
}

func (ps *ProductService) GetProducts(filter ProductFilter) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := ps.db.Model(&models.Product{}).Preload("Category").Preload("Department")

	// Apply filters
	if filter.CategoryID != "" {
		query = query.Where("category_id = ?", filter.CategoryID)
	}

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ? OR code ILIKE ?",
			searchTerm, searchTerm, searchTerm)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.DepartmentID != "" {
		query = query.Where("department_id = ?", filter.DepartmentID)
	}

	query = query.Where("is_active = ?", true)

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (filter.Page - 1) * filter.Limit
	if err := query.Offset(offset).Limit(filter.Limit).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (ps *ProductService) GetProductByID(id string) (*models.Product, error) {
	var product models.Product

	err := ps.db.Preload("Category").Preload("Department").
		Where("id = ? AND is_active = ?", id, true).
		First(&product).Error

	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (ps *ProductService) GetCategories() ([]models.Category, error) {
	var categories []models.Category

	err := ps.db.Where("is_active = ?", true).Find(&categories).Error
	if err != nil {
		return nil, err
	}

	return categories, nil
}

func (ps *ProductService) UpdateProductQuantity(productID string, quantityChange int) error {
	return ps.db.Model(&models.Product{}).
		Where("id = ?", productID).
		Update("available_quantity", gorm.Expr("available_quantity + ?", quantityChange)).Error
}
