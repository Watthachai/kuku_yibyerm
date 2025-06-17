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
	Report     *ReportController
}

// NewControllers creates a new Controllers instance
func NewControllers(services *services.Services) *Controllers {
	return &Controllers{
		Auth:       NewAuthController(services.DB),
		User:       NewUserController(services.DB),
		Product:    NewProductController(services.Product),
		Category:   NewCategoryController(services.DB),
		Department: NewDepartmentController(services.DB, services.Department),
		Request:    NewRequestController(services.Request),
		Dashboard:  NewDashboardController(services.DB),
		Report:     NewReportController(services.DB),
	}
}
