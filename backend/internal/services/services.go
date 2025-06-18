package services

import (
	"gorm.io/gorm"
)

// Services holds all service instances
type Services struct {
	Auth       *AuthService
	User       *UserService
	Product    *ProductService
	Category   *CategoryService
	Department *DepartmentService
	Request    *RequestService
	DB         *gorm.DB // ⭐ เพิ่มบรรทัดนี้
}

// NewServices creates a new Services instance
func NewServices(db *gorm.DB) *Services {
	productService := NewProductService(db)
	return &Services{
		Auth:       NewAuthService(db),
		User:       NewUserService(db),
		Product:    productService,
		Category:   NewCategoryService(db),
		Department: NewDepartmentService(db),
		Request:    NewRequestService(db, productService),
		DB:         db, // ⭐ เพิ่มบรรทัดนี้
	}
}
