// services/category_service.go
package services

import (
	"ku-asset/dto"
	"ku-asset/models"

	"gorm.io/gorm"
)

type CategoryService interface {
	GetAll() ([]dto.CategoryResponse, error)
	GetByID(id string) (*dto.CategoryResponse, error)
	Create(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error)
	Update(id string, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error)
	Delete(id string) error
}

type categoryService struct {
	db *gorm.DB
}

func NewCategoryService(db *gorm.DB) CategoryService {
	return &categoryService{db: db}
}

func (s *categoryService) GetAll() ([]dto.CategoryResponse, error) {
	var categories []models.Category
	if err := s.db.Find(&categories).Error; err != nil {
		return nil, err
	}
	var response []dto.CategoryResponse
	for _, cat := range categories {
		response = append(response, *mapCategoryToResponse(&cat))
	}
	return response, nil
}

func (s *categoryService) GetByID(id string) (*dto.CategoryResponse, error) {
	var category models.Category
	if err := s.db.First(&category, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapCategoryToResponse(&category), nil
}

func (s *categoryService) Create(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	category := models.Category{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    true,
	}
	if err := s.db.Create(&category).Error; err != nil {
		return nil, err
	}
	return mapCategoryToResponse(&category), nil
}

func (s *categoryService) Update(id string, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	var category models.Category
	if err := s.db.First(&category, "id = ?", id).Error; err != nil {
		return nil, err
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Description != "" {
		category.Description = req.Description
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	if err := s.db.Save(&category).Error; err != nil {
		return nil, err
	}
	return mapCategoryToResponse(&category), nil
}

func (s *categoryService) Delete(id string) error {
	return s.db.Delete(&models.Category{}, "id = ?", id).Error
}

// Helper
func mapCategoryToResponse(cat *models.Category) *dto.CategoryResponse {
	return &dto.CategoryResponse{
		ID:          cat.ID,
		Name:        cat.Name,
		Description: cat.Description,
		IsActive:    cat.IsActive,
	}
}
