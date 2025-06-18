package main

import (
	"ku-asset/internal/controllers"
	"ku-asset/internal/database"
	"ku-asset/internal/migrations"
	"ku-asset/internal/routes"
	"ku-asset/internal/services"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚀 Starting Kuku Yipyerm Backend Server...")

	// โหลด .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	} else {
		log.Println("✅ .env file loaded successfully")
	}

	// Debug environment variables
	log.Printf("🔑 JWT_SECRET loaded: %s", func() string {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			return "NOT SET"
		}
		return secret[:10] + "..."
	}())

	// ⭐ ใช้ helper function จาก database package
	dbConfig := database.NewConfigFromEnv()

	// Initialize database
	db, err := database.Connect(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("✅ Database connected successfully")

	// Run migrations
	if err := migrations.AutoMigrate(db); err != nil {
		log.Printf("Migration error: %v", err)
	}

	// Set Gin mode
	ginMode := getEnv("GIN_MODE", "debug")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Add logging middleware
	router.Use(gin.Logger())

	// Initialize services
	services := services.NewServices(db)

	// Initialize controllers
	controllers := controllers.NewControllers(services)

	// Setup routes
	routes.SetupRoutes(router, controllers)

	// Start server
	port := getEnv("PORT", "8080")

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// Helper function to get environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
