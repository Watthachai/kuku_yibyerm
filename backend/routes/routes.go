package routes

import (
	"ku-asset/controllers"
	"ku-asset/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SetupRoutes คือฟังก์ชันหลักในการตั้งค่า Route ทั้งหมด
func SetupRoutes(r *gin.Engine, controllers *controllers.Controllers) {
	// Middleware พื้นฐาน เช่น CORS
	r.Use(middleware.CORSMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// จัดกลุ่ม Route ทั้งหมดภายใต้ /api/v1
	api := r.Group("/api/v1")
	setupAPIRoutes(api, controllers)

	// ตั้งค่า web routes (สำหรับ serve static files)
	setupWebRoutes(r)
}

// setupAPIRoutes เป็นตัวประสานงาน เรียกฟังก์ชันย่อยเพื่อตั้งค่า Route แต่ละกลุ่ม
func setupAPIRoutes(api *gin.RouterGroup, c *controllers.Controllers) {
	setupAuthRoutes(api.Group("/auth"), c.Auth)
	setupAdminRoutes(api.Group("/admin"), c)
	setupProtectedRoutes(api.Group(""), c)
}

// setupAuthRoutes จัดการ Route ที่ไม่ต้องมีการยืนยันตัวตน
func setupAuthRoutes(group *gin.RouterGroup, authController *controllers.AuthController) {
	group.POST("/login", authController.Login)
	group.POST("/register", authController.Register)
	group.POST("/refresh", authController.RefreshToken)
	group.POST("/oauth/google", authController.GoogleOAuth)
}

// setupAdminRoutes จัดการ Route ที่ต้องใช้สิทธิ์ "ADMIN" เท่านั้น
func setupAdminRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	// ⭐ ตรวจสอบลำดับ middleware - AuthMiddleware ต้องมาก่อน
	protected := group.Group("")
	protected.Use(middleware.AuthMiddleware())  // ❶ ใส่ auth ก่อน
	protected.Use(middleware.AdminMiddleware()) // ❷ แล้วค่อย admin
	{
		// Dashboard Routes
		protected.GET("/stats", c.Dashboard.GetAdminStats)
		protected.GET("/activity", c.Dashboard.GetRecentActivity)
		protected.GET("/system-stats", c.Dashboard.GetSystemStats)

		// Admin User Management
		protected.GET("/users", c.User.GetUsers)
		protected.GET("/users/:id", c.User.GetUser)
		protected.PUT("/users/:id", c.User.UpdateUser)
		protected.DELETE("/users/:id", c.User.DeleteUser)

		// Admin Request Management
		protected.GET("/requests", c.Request.GetAllRequests)
		protected.PUT("/requests/:id/status", c.Request.UpdateRequestStatus)
		protected.GET("/requests/:id/pdf", c.Request.DownloadRequestPDF) // ⭐ เพิ่มบรรทัดนี้

		// Department Management
		protected.GET("/departments", c.Department.GetDepartments)
		protected.GET("/departments/:id", c.Department.GetDepartment)
		protected.POST("/departments", c.Department.CreateDepartment) // เพิ่มเส้นทางนี้
		protected.PATCH("/departments/:id", c.Department.UpdateDepartment)
		protected.DELETE("/departments/:id", c.Department.DeleteDepartment)
	}
}

// setupProtectedRoutes จัดการ Route ทั้งหมดที่ผู้ใช้ต้องล็อกอินก่อน
func setupProtectedRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	group.Use(middleware.AuthMiddleware())
	{
		// --- User Profile Routes ---
		profile := group.Group("/profile")
		{
			profile.GET("", c.User.GetProfile)
			profile.PUT("", c.User.UpdateProfile)   // เก้า PUT method
			profile.PATCH("", c.User.UpdateProfile) // เพิ่ม PATCH method
			profile.POST("/change-password", c.User.ChangePassword)
			profile.GET("/stats", c.User.GetUserStats) // New stats endpoint
		}

		// --- Product Routes ---
		products := group.Group("/products")
		{
			products.GET("", c.Product.GetProducts)
			products.GET("/:id", c.Product.GetProduct)

			// Admin only routes
			products.POST("", middleware.AuthorizeRole("ADMIN"), c.Product.CreateProduct)
			products.PUT("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.UpdateProduct)
			products.DELETE("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.DeleteProduct)
		}

		// ⭐ Upload Routes (Admin only with rate limiting)
		upload := group.Group("/upload")
		upload.Use(middleware.AuthorizeRole("ADMIN"))
		upload.Use(middleware.UploadRateLimiter.Middleware())   // 10 uploads per minute
		upload.Use(middleware.UploadHourlyLimiter.Middleware()) // 50 uploads per hour
		{
			upload.POST("/product-image", c.Upload.UploadProductImage)
			upload.DELETE("/product-image/:filename", c.Upload.DeleteProductImage)
		}

		// --- Request Routes (User Routes เท่านั้น) ---
		requests := group.Group("/requests")
		{
			requests.POST("", c.Request.CreateRequest)   // ✅ User สร้างคำขอ
			requests.GET("/my", c.Request.GetMyRequests) // ✅ User ดูคำขอของตัวเอง
			requests.GET("/:id", c.Request.GetRequest)   // ✅ User ดูรายละเอียดคำขอของตัวเอง
		}

		// --- Category & Department Routes ---
		group.GET("/categories", c.Category.GetCategories)
		group.GET("/categories/:id", c.Category.GetCategory)
		group.GET("/departments", c.Department.GetDepartments)
		group.GET("/departments/:id", c.Department.GetDepartment)
		group.GET("/faculties", c.Department.GetFaculties) // เพิ่ม faculties endpoint
	}
}

// setupWebRoutes จัดการ Route สำหรับการ serve static files
func setupWebRoutes(r *gin.Engine) {
	r.Static("/static", "./static")
	r.Static("/uploads", "./uploads")
}
