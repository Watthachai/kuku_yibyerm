package controllers

import (
	"ku-asset/internal/services"
)

// Controllers holds all controller instances
type Controllers struct {
	Auth       *AuthController
	User       *UserController
	Product    *ProductController
	Category   *CategoryController
	Department *DepartmentController
	Request    *RequestController
	Dashboard  *DashboardController
	OAuth      *OAuthController
	// Report     *ReportController  // comment ออกก่อนถ้าไม่มี
}

// NewControllers creates a new Controllers instance
func NewControllers(services *services.Services) *Controllers {
	return &Controllers{
		Auth:       NewAuthController(services.Auth, services.DB),             // ใช้ services.DB
		User:       NewUserController(services.DB),                            // เพิ่ม services.DB
		Product:    NewProductController(services.Product),                    // เพิ่ม services.DB
		Category:   NewCategoryController(services.DB),                        // เพิ่ม services.DB
		Department: NewDepartmentController(services.DB, services.Department), // แก้ไข parameter order
		Request:    NewRequestController(services.Request),                    // เพิ่ม services.DB
		Dashboard:  NewDashboardController(),
		// Report:     NewReportController(services.DB),  // comment ออกก่อนถ้าไม่มี
	}
}
