package routes

import (
	"kuku-yipyerm/internal/controllers"
	"kuku-yipyerm/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter configures the application's routes.
func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// CORS Middleware: Allow requests from your Next.js frontend
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		//"https://your-frontend-domain.com", // Replace with your actual domain
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{
		"Origin", "Content-Type", "Accept", "Authorization",
		"X-Requested-With", "Access-Control-Request-Method",
		"Access-Control-Request-Headers",
	}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// Create controllers
	authController := controllers.NewAuthController(db)
	oauthController := controllers.NewOAuthController(db)
	userController := controllers.NewUserController(db)
	healthController := controllers.NewHealthController(db)

	// Health check route (no versioning, simple path)
	r.GET("/health", healthController.HealthCheck)

	// Group routes under /api/v1
	apiV1 := r.Group("/api/v1")
	{
		// Public auth routes
		authRoutes := apiV1.Group("/auth")
		{
			authRoutes.POST("/sign-up", authController.SignUp)
			authRoutes.POST("/sign-in", authController.SignIn)
			authRoutes.POST("/refresh", authController.RefreshToken)

			// OAuth routes
			oauth := authRoutes.Group("/oauth")
			{
				oauth.POST("/google", oauthController.GoogleOAuth)
			}
		}

		// Protected routes (require authentication)
		protected := apiV1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			users := protected.Group("/users")
			{
				users.GET("/profile", userController.GetProfile)
				users.PUT("/profile", userController.UpdateProfile)
			}

			// Admin routes (require ADMIN role)
			admin := protected.Group("/admin")
			admin.Use(middleware.AuthorizeRole("ADMIN"))
			{
				admin.GET("/users", userController.GetAllUsers)
			}
		}

		// Optional auth routes (work with or without authentication)
		public := apiV1.Group("/")
		public.Use(middleware.OptionalAuthMiddleware())
		{
			// Add public routes that can optionally use authentication
			// Example: public.GET("/posts", postController.GetPosts)
		}
	}

	return r
}
