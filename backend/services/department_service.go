// services/department_service.go
package services

import (
	"errors"
	"ku-asset/dto"
	"ku-asset/models"
	"strings"

	"gorm.io/gorm"
)

// 1. สร้าง Interface
type DepartmentService interface {
	GetDepartments(query *dto.DepartmentQuery) ([]dto.DepartmentResponse, error)
	GetDepartmentByID(id uint) (*dto.DepartmentResponse, error)
	GetFaculties() ([]dto.DepartmentResponse, error)
}

// 2. สร้าง struct ที่เป็น implementation
type departmentService struct {
	db *gorm.DB
}

// 3. แก้ไข Constructor ให้ถูกต้องและ return เป็น interface
func NewDepartmentService(db *gorm.DB) DepartmentService {
	return &departmentService{db: db}
}

// 4. ย้าย Logic จาก Controller มาไว้ที่นี่
func (s *departmentService) GetDepartments(query *dto.DepartmentQuery) ([]dto.DepartmentResponse, error) {
	var departments []models.Department
	dbQuery := s.db.Where("is_active = ?", true)

	if query.Type != "" {
		dbQuery = dbQuery.Where("type = ?", strings.ToUpper(query.Type))
	}
	if query.Include == "hierarchy" {
		dbQuery = dbQuery.Preload("Parent").Preload("Children")
	}

	if err := dbQuery.Order("name_th ASC").Find(&departments).Error; err != nil {
		return nil, err
	}

	var response []dto.DepartmentResponse
	for _, dept := range departments {
		response = append(response, *mapDepartmentToResponse(&dept))
	}
	return response, nil
}

func (s *departmentService) GetDepartmentByID(id uint) (*dto.DepartmentResponse, error) {
	var department models.Department
	if err := s.db.Preload("Parent").Preload("Children").First(&department, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("department not found")
		}
		return nil, err
	}
	return mapDepartmentToResponse(&department), nil
}

func (s *departmentService) GetFaculties() ([]dto.DepartmentResponse, error) {
	var faculties []models.Department
	if err := s.db.Where("type = ? AND is_active = ?", models.DepartmentTypeFaculty, true).
		Order("name_th ASC").Find(&faculties).Error; err != nil {
		return nil, err
	}

	var response []dto.DepartmentResponse
	for _, faculty := range faculties {
		response = append(response, *mapDepartmentToResponse(&faculty))
	}
	return response, nil
}

// Helper to map model to DTO
func mapDepartmentToResponse(dept *models.Department) *dto.DepartmentResponse {
	return &dto.DepartmentResponse{
		ID:     dept.ID,
		Code:   dept.Code,
		NameTh: dept.NameTH,
		NameEn: dept.NameEN,
		Type:   string(dept.Type),
	}
}
