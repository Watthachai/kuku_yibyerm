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
	// Public routes
	auth := api.Group("/auth")
	{
		auth.POST("/login", controllers.Auth.Login)
		auth.POST("/register", controllers.Auth.Register)
		auth.POST("/refresh", controllers.Auth.RefreshToken)
		auth.POST("/forgot-password", controllers.Auth.ForgotPassword)
		auth.POST("/reset-password", controllers.Auth.ResetPassword)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		users := protected.Group("/users")
		{
			users.GET("/profile", controllers.User.GetProfile)
			users.PUT("/profile", controllers.User.UpdateProfile)
			users.POST("/change-password", controllers.User.ChangePassword)
		}

		// Product routes
		products := protected.Group("/products")
		{
			products.GET("", controllers.Product.GetProducts)
			products.GET("/:id", controllers.Product.GetProduct)
		}

		// Category routes
		categories := protected.Group("/categories")
		{
			categories.GET("", controllers.Product.GetCategories)
		}

		// Department routes
		departments := protected.Group("/departments")
		{
			departments.GET("", controllers.Department.GetDepartments)
		}

		// Request routes
		requests := protected.Group("/requests")
		{
			requests.POST("", controllers.Request.CreateRequest)
			requests.GET("/my", controllers.Request.GetMyRequests)
			requests.GET("/:id", controllers.Request.GetRequest)
			requests.PUT("/:id/cancel", controllers.Request.CancelRequest)
		}

		// Admin routes
		admin := protected.Group("/admin")
		admin.Use(middleware.AdminMiddleware())
		{
			// Admin user management
			adminUsers := admin.Group("/users")
			{
				adminUsers.GET("", controllers.User.GetAllUsers)
				adminUsers.GET("/:id", controllers.User.GetUser)
				adminUsers.PUT("/:id", controllers.User.UpdateUser)
				adminUsers.DELETE("/:id", controllers.User.DeleteUser)
				adminUsers.PUT("/:id/activate", controllers.User.ActivateUser)
				adminUsers.PUT("/:id/deactivate", controllers.User.DeactivateUser)
			}

			// Admin product management
			adminProducts := admin.Group("/products")
			{
				adminProducts.POST("", controllers.Product.CreateProduct)
				adminProducts.PUT("/:id", controllers.Product.UpdateProduct)
				adminProducts.DELETE("/:id", controllers.Product.DeleteProduct)
				adminProducts.PUT("/:id/activate", controllers.Product.ActivateProduct)
				adminProducts.PUT("/:id/deactivate", controllers.Product.DeactivateProduct)
			}

			// Admin category management
			adminCategories := admin.Group("/categories")
			{
				adminCategories.POST("", controllers.Category.CreateCategory)
				adminCategories.PUT("/:id", controllers.Category.UpdateCategory)
				adminCategories.DELETE("/:id", controllers.Category.DeleteCategory)
			}

			// Admin request management
			adminRequests := admin.Group("/requests")
			{
				adminRequests.GET("", controllers.Request.GetAllRequests)
				adminRequests.GET("/:id", controllers.Request.GetRequestDetails)
				adminRequests.PUT("/:id/approve", controllers.Request.ApproveRequest)
				adminRequests.PUT("/:id/reject", controllers.Request.RejectRequest)
				adminRequests.PUT("/:id/issue", controllers.Request.IssueRequest)
				adminRequests.PUT("/:id/complete", controllers.Request.CompleteRequest)
			}

			// Admin dashboard/statistics
			adminDashboard := admin.Group("/dashboard")
			{
				adminDashboard.GET("/stats", controllers.Dashboard.GetStats)
				adminDashboard.GET("/recent-requests", controllers.Dashboard.GetRecentRequests)
				adminDashboard.GET("/popular-products", controllers.Dashboard.GetPopularProducts)
			}

			// Admin reports
			adminReports := admin.Group("/reports")
			{
				adminReports.GET("/requests", controllers.Report.GetRequestsReport)
				adminReports.GET("/products", controllers.Report.GetProductsReport)
				adminReports.GET("/usage", controllers.Report.GetUsageReport)
				adminReports.GET("/export/requests", controllers.Report.ExportRequestsReport)
			}
		}
	}
}

// setupWebRoutes sets up web routes (for serving static files, etc.)
func setupWebRoutes(r *gin.Engine) {
	// Serve static files
	r.Static("/static", "./static")
	r.Static("/uploads", "./uploads")

	// Web interface routes (if needed)
	web := r.Group("")
	{
		web.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "KU Asset Management System",
				"version": "1.0.0",
				"docs":    "/api/v1/docs",
			})
		})
	}
}
