package main

import (
	"ku-asset/controllers"
	"ku-asset/database"
	"ku-asset/middleware"
	"ku-asset/migrations"
	"ku-asset/routes"
	"ku-asset/services"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚀 Starting KU Asset Backend Server...")

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	dbConfig := database.NewConfigFromEnv()
	db, err := database.Connect(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("✅ Database connected successfully")

	if err := migrations.RunMigrations(db); err != nil {
		log.Fatalf("Could not run migrations: %v", err)
	}

	ginMode := getEnv("GIN_MODE", "debug")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// --- ✅ THE FINAL FIX ---
	// 1. Use gin.New() to create a blank engine
	router := gin.New()

	// 2. Add middleware MANUALLY in the correct order
	router.Use(middleware.PanicRecoveryMiddleware()) // MUST BE FIRST!
	router.Use(gin.Logger())                         // Add logger back
	router.Use(middleware.CORSMiddleware())          // Then add our CORS
	// -----------------------

	services := services.NewServices(db)
	controllers := controllers.NewControllers(services)
	routes.SetupRoutes(router, controllers)

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
