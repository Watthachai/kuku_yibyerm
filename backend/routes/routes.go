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

// --- Modular Route Functions ---

// setupAuthRoutes จัดการ Route ที่ไม่ต้องมีการยืนยันตัวตน
func setupAuthRoutes(group *gin.RouterGroup, authController *controllers.AuthController) {
	group.POST("/login", authController.Login)
	group.POST("/register", authController.Register)
	group.POST("/refresh", authController.RefreshToken)
	group.POST("/oauth/google", authController.GoogleOAuth)
}

// setupAdminRoutes จัดการ Route ที่ต้องใช้สิทธิ์ "ADMIN" เท่านั้น
func setupAdminRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	group.Use(middleware.AuthMiddleware())
	group.Use(middleware.AuthorizeRole("ADMIN"))
	{
		// Dashboard Routes
		group.GET("/stats", c.Dashboard.GetAdminStats)
		group.GET("/activity", c.Dashboard.GetRecentActivity)
		group.GET("/system-stats", c.Dashboard.GetSystemStats)

		// Admin User Management
		group.GET("/users", c.User.GetUsers)
		group.GET("/users/:id", c.User.GetUser)
		group.PUT("/users/:id", c.User.UpdateUser)
		group.DELETE("/users/:id", c.User.DeleteUser)

		// Admin Request Management
		group.GET("/requests", c.Request.GetAllRequests) // ✅ ดูคำขอเบิกทั้งหมด
	}
}

// setupProtectedRoutes จัดการ Route ทั้งหมดที่ผู้ใช้ต้องล็อกอินก่อน
func setupProtectedRoutes(group *gin.RouterGroup, c *controllers.Controllers) {
	group.Use(middleware.AuthMiddleware())
	{
		// --- User Profile Routes (สำหรับผู้ใช้จัดการข้อมูลตัวเอง) ---
		profile := group.Group("/profile")
		{
			profile.GET("", c.User.GetProfile)
			profile.PUT("", c.User.UpdateProfile)
			profile.POST("/change-password", c.User.ChangePassword)
		}

		// --- Product Routes (แคตตาล็อกสินค้า) ---
		products := group.Group("/products")
		{
			products.GET("", c.Product.GetProducts)
			products.GET("/:id", c.Product.GetProduct)
			// การสร้าง/แก้ไข/ลบ Product ให้สิทธิ์เฉพาะ Admin
			products.POST("", middleware.AuthorizeRole("ADMIN"), c.Product.CreateProduct)
			products.PUT("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.UpdateProduct)
			products.DELETE("/:id", middleware.AuthorizeRole("ADMIN"), c.Product.DeleteProduct)
		}

		// --- Asset Routes (ของในคลัง) ---
		assets := group.Group("/assets")
		{
			assets.GET("", c.Asset.GetAssets)
			// การเพิ่มของเข้าคลัง ให้สิทธิ์เฉพาะ Admin
			assets.POST("", middleware.AuthorizeRole("ADMIN"), c.Asset.CreateAsset)
		}

		// --- Request Routes (การขอเบิก) ---
		requests := group.Group("/requests")
		{
			requests.GET("/:id", c.Request.GetRequest) // ดูรายละเอียดคำขอของตัวเอง
			requests.POST("", c.Request.CreateRequest) // สร้างคำขอเบิกใหม่
			// การอัปเดตสถานะ (อนุมัติ/ปฏิเสธ) ให้สิทธิ์เฉพาะ Admin
			requests.PUT("/:id/status", middleware.AuthorizeRole("ADMIN"), c.Request.UpdateRequestStatus)
		}

		// --- Category & Department Routes (ข้อมูลทั่วไป) ---
		group.GET("/categories", c.Category.GetCategories)
		group.GET("/categories/:id", c.Category.GetCategory)
		group.GET("/departments", c.Department.GetDepartments)
		group.GET("/departments/:id", c.Department.GetDepartment)
	}
}

// setupWebRoutes จัดการ Route สำหรับการ serve static files
func setupWebRoutes(r *gin.Engine) {
	r.Static("/static", "./static")
	r.Static("/uploads", "./uploads")
}
