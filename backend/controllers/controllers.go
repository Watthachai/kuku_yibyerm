// controllers/controllers.go
package controllers

import (
	"ku-asset/services"
)

type Controllers struct {
	Auth       *AuthController
	User       *UserController
	Product    *ProductController
	Request    *RequestController
	Category   *CategoryController
	Department *DepartmentController
	Dashboard  *DashboardController
	Asset      *AssetController // ⭐️ เราใช้ชื่อ field ว่า 'Asset'
}

func NewControllers(s *services.Services) *Controllers {
	return &Controllers{
		Auth:       NewAuthController(s.Auth),
		User:       NewUserController(s.User),
		Product:    NewProductController(s.Product),
		Request:    NewRequestController(s.Request),
		Category:   NewCategoryController(s.Category),
		Department: NewDepartmentController(s.Department),
		Dashboard:  NewDashboardController(s.Dashboard),
		Asset:      NewAssetController(s.Asset), // ⭐️ สร้าง instance ใส่ใน field 'Asset'
	}
}
