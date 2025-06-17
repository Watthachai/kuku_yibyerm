package services

import (
	"gorm.io/gorm"
)

// Services holds all service instances
type Services struct {
	DB         *gorm.DB // เพิ่ม DB field
	Auth       *AuthService
	User       *UserService
	Product    *ProductService
	Category   *CategoryService
	Department *DepartmentService
	Request    *RequestService
	Dashboard  *DashboardService
	Report     *ReportService
}

// NewServices creates a new Services instance
func NewServices(db *gorm.DB) *Services {
	// Create services
	authService := NewAuthService(db)
	userService := NewUserService(db)
	productService := NewProductService(db)
	categoryService := NewCategoryService(db)
	departmentService := NewDepartmentService(db)
	requestService := NewRequestService(db, productService)
	dashboardService := NewDashboardService(db)
	reportService := NewReportService(db)

	return &Services{
		DB:         db, // เพิ่ม DB ในการ return
		Auth:       authService,
		User:       userService,
		Product:    productService,
		Category:   categoryService,
		Department: departmentService,
		Request:    requestService,
		Dashboard:  dashboardService,
		Report:     reportService,
	}
}
