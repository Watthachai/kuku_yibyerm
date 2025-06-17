package services

import (
	"ku-asset/internal/models"

	"gorm.io/gorm"
)

type DepartmentService struct {
	db *gorm.DB
}

func NewDepartmentService(db *gorm.DB) *DepartmentService {
	return &DepartmentService{db: db}
}

func (ds *DepartmentService) GetDepartments() ([]models.Department, error) {
	var departments []models.Department

	err := ds.db.Where("is_active = ?", true).Find(&departments).Error
	if err != nil {
		return nil, err
	}

	return departments, nil
}
