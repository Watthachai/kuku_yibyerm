package services

import (
	"gorm.io/gorm"
)

type Services struct {
	Auth       AuthService
	User       UserService
	Product    ProductService // 👈 RequestService จะใช้ตัวนี้
	Category   CategoryService
	Department DepartmentService
	Request    RequestService
	Dashboard  DashboardService
}

func NewServices(db *gorm.DB) *Services {
	productService := NewProductService(db)

	return &Services{
		Auth:       NewAuthService(db),
		User:       NewUserService(db),
		Product:    productService,
		Category:   NewCategoryService(db),
		Department: NewDepartmentService(db),
		Dashboard:  NewDashboardService(db),
		Request:    NewRequestService(db, productService), // 👈 ส่ง productService เข้าไป

	}
}
