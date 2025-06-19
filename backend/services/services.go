// services/services.go
package services

import (
	"gorm.io/gorm"
)

// Services holds all service INTERFACES
type Services struct {
	Auth       AuthService
	User       UserService
	Product    ProductService
	Category   CategoryService
	Department DepartmentService
	Request    RequestService
	Dashboard  DashboardService
	Asset      AssetService
}

// NewServices creates a new Services instance
func NewServices(db *gorm.DB) *Services {
	// สร้าง service ที่เป็น dependency ก่อน
	productService := NewProductService(db)
	assetService := NewAssetService(db)

	// สร้าง service ที่เหลือ
	authService := NewAuthService(db)
	userService := NewUserService(db)
	categoryService := NewCategoryService(db)
	departmentService := NewDepartmentService(db)
	dashboardService := NewDashboardService(db)

	// สร้าง RequestService โดย inject dependency เข้าไป
	requestService := NewRequestService(db, assetService)

	// ส่งกลับ struct ที่มี service ทั้งหมด
	return &Services{
		Auth:       authService,
		User:       userService,
		Product:    productService,
		Category:   categoryService,
		Department: departmentService,
		Request:    requestService, // 👈 ใช้ตัวแปรที่สร้างไว้
		Dashboard:  dashboardService,
		Asset:      assetService,
	}
}
