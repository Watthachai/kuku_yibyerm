// routes/routes.go (ฉบับสมบูรณ์)

package routes

import (
	"ku-asset/controllers"
	"ku-asset/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, controllers *controllers.Controllers) {
	r.Use(middleware.CORSMiddleware())
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	api := r.Group("/api/v1")
	setupAPIRoutes(api, controllers)
	setupWebRoutes(r)
}

func setupAPIRoutes(api *gin.RouterGroup, c *controllers.Controllers) {
	setupAuthRoutes(api.Group("/auth"), c.Auth)
	setupAdminRoutes(api.Group("/admin"), c)
	setupProtectedRoutes(api.Group(""), c)
}

// --- Modular Route Functions ---

func setupAuthRoutes(group *gin.RouterGroup, authController *controllers.AuthController) {
	group.POST("/login", authController.Login)
	group.POST("/register", authController.Register)
	group.POST("/refresh", authController.RefreshToken)
	group.POST("/oauth/google", authController.GoogleOAuth)
	// ... other auth routes
}

func setupAdminRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	group.Use(middleware.AuthMiddleware())
	group.Use(middleware.AuthorizeRole("ADMIN"))
	{
		// Dashboard Routes
		group.GET("/stats", c.Dashboard.GetAdminStats)
		// group.GET("/activity", c.Dashboard.GetRecentActivity) // ⭐️ Comment out, not implemented yet
		// group.GET("/system-stats", c.Dashboard.GetSystemStats) // ⭐️ Comment out, not implemented yet

		// Admin User Management
		group.GET("/users", c.User.GetUsers)       // ⭐️ ใช้ GetUsers (มี s) สำหรับ pagination
		group.PUT("/users/:id", c.User.UpdateUser) // ⭐️ รวมการอัปเดตทั้งหมดไว้ที่นี่
		group.DELETE("/users/:id", c.User.DeleteUser)
		group.GET("/users/:id", c.User.GetUser)
	}
}

func setupProtectedRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	group.Use(middleware.AuthMiddleware())
	{
		// --- User Profile Routes ---
		profile := group.Group("/profile") // สร้าง group สำหรับ /profile
		{
			profile.GET("", c.User.GetProfile)
			profile.PUT("", c.User.UpdateProfile)
			profile.POST("/change-password", c.User.ChangePassword)
		}

		// --- Product Routes --- (CRUD สำหรับจัดการแคตตาล็อก)
		products := group.Group("/products")
		{
			products.GET("", c.Product.GetProducts)
			products.GET("/:id", c.Product.GetProduct)
			// Admin-only actions for products
			products.POST("", middleware.AuthorizeRole("ADMIN"), c.Product.CreateProduct)
			products.PUT("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.UpdateProduct)
			products.DELETE("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.DeleteProduct)
		}

		// --- Asset Routes --- (CRUD สำหรับจัดการของในคลัง)
		assets := group.Group("/assets")
		{
			assets.POST("", middleware.AuthorizeRole("ADMIN"), c.Asset.CreateAsset) // ⭐️ ใช้ c.Asset
			// assets.GET("", c.Asset.GetAssets)
		}

		// --- Request Routes ---
		requests := group.Group("/requests")
		{
			// requests.GET("", c.Request.GetAllRequests) // ⭐️ For admin, move to /admin/requests
			requests.GET("/:id", c.Request.GetRequest)
			requests.POST("", c.Request.CreateRequest)
			// ⭐️ เปลี่ยนจาก Approve/Reject เป็น Endpoint เดียวคือ UpdateStatus
			requests.PUT("/:id/status", middleware.AuthorizeRole("ADMIN"), c.Request.UpdateRequestStatus)
		}

		// --- Category & Department Routes --- (Read-only for normal users)
		group.GET("/categories", c.Category.GetCategories)
		group.GET("/categories/:id", c.Category.GetCategory)
		group.GET("/departments", c.Department.GetDepartments)
		group.GET("/departments/:id", c.Department.GetDepartment)
	}
}

func setupWebRoutes(r *gin.Engine) {
	r.Static("/static", "./static")
	r.Static("/uploads", "./uploads")
}
