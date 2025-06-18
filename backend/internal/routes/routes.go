package routes

import (
	"ku-asset/internal/controllers"
	"ku-asset/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes sets up all routes for the application
func SetupRoutes(r *gin.Engine, controllers *controllers.Controllers) {
	// Add CORS middleware
	r.Use(middleware.CORSMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "KU Asset Management API is running",
		})
	})

	// API routes
	api := r.Group("/api/v1")

	// Setup API routes
	setupAPIRoutes(api, controllers)

	// Setup web routes (if needed)
	setupWebRoutes(r)
}

// setupAPIRoutes sets up API routes
func setupAPIRoutes(api *gin.RouterGroup, controllers *controllers.Controllers) {
	// Auth routes (ไม่ต้องมี middleware)
	auth := api.Group("/auth")
	{
		auth.POST("/login", controllers.Auth.Login)
		auth.POST("/register", controllers.Auth.Register)
		auth.POST("/refresh", controllers.Auth.RefreshToken)
		auth.POST("/forgot-password", controllers.Auth.ForgotPassword)
		auth.POST("/reset-password", controllers.Auth.ResetPassword)
		auth.POST("/oauth/google", controllers.Auth.GoogleOAuth)
	}

	// ⭐ Admin routes (ต้องมี middleware)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware())       // ⭐ ต้องมีบรรทัดนี้
	admin.Use(middleware.AuthorizeRole("ADMIN")) // ⭐ และบรรทัดนี้
	{
		admin.GET("/stats", controllers.Dashboard.GetAdminStats)
		admin.GET("/activity", controllers.Dashboard.GetRecentActivity)
		admin.GET("/system-stats", controllers.Dashboard.GetSystemStats)
		admin.GET("/users", controllers.User.GetUsers)
		admin.PATCH("/users/:id/status", controllers.User.UpdateUserStatus)
		admin.PATCH("/users/:id/role", controllers.User.UpdateUserRole)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes - ใช้ methods ที่มีอยู่จริง
		users := protected.Group("/users")
		{
			users.GET("", controllers.User.GetAllUsers)
			users.GET("/:id", controllers.User.GetUser) // เปลี่ยนจาก GetUserByID
			users.PUT("/:id", controllers.User.UpdateUser)
			users.DELETE("/:id", controllers.User.DeleteUser)
		}

		// Product routes
		products := protected.Group("/products")
		{
			products.GET("", controllers.Product.GetProducts)
			products.GET("/:id", controllers.Product.GetProduct)
			products.POST("", controllers.Product.CreateProduct)
			products.PUT("/:id", controllers.Product.UpdateProduct)
			products.DELETE("/:id", controllers.Product.DeleteProduct)
		}

		// Request routes - ใช้ methods ที่มีอยู่จริง
		requests := protected.Group("/requests")
		{
			requests.GET("", controllers.Request.GetAllRequests)
			requests.GET("/:id", controllers.Request.GetRequest) // เปลี่ยนจาก GetRequestByID
			requests.POST("", controllers.Request.CreateRequest)
			requests.PUT("/:id/approve", controllers.Request.ApproveRequest) // ใช้ ApproveRequest แทน
			requests.PUT("/:id/reject", controllers.Request.RejectRequest)   // ใช้ RejectRequest แทน
		}

		// Category routes - แก้ไขให้ตรงกับ methods ที่มีจริง
		categories := protected.Group("/categories")
		{
			categories.GET("", controllers.Category.GetCategories)   // แก้จาก GetAllCategories
			categories.GET("/:id", controllers.Category.GetCategory) // แก้จาก GetCategoryByID
			categories.POST("", controllers.Category.CreateCategory)
			categories.PUT("/:id", controllers.Category.UpdateCategory)
			categories.DELETE("/:id", controllers.Category.DeleteCategory)
		}

		// Department routes - ใช้ methods ที่มีอยู่จริง
		departments := protected.Group("/departments")
		{
			departments.GET("", controllers.Department.GetDepartments)    // เปลี่ยนจาก GetAllDepartments
			departments.GET("/:id", controllers.Department.GetDepartment) // เปลี่ยนจาก GetDepartmentByID
			departments.GET("/faculties", controllers.Department.GetFaculties)
			// ลบ POST, PUT, DELETE ออกก่อน เพราะยังไม่มี
		}
	}
}

// setupWebRoutes sets up web routes (for serving static files, etc.)
func setupWebRoutes(r *gin.Engine) {
	// Serve static files
	r.Static("/static", "./static")
	r.Static("/uploads", "./uploads")
}
