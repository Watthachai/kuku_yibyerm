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
	// เอา log.Fatal ออกแล้ว
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

	// ใช้ gin.New() และเรียงลำดับ Middleware เอง
	router := gin.New()
	router.Use(middleware.PanicRecoveryMiddleware()) // 👈 MUST BE FIRST!
	router.Use(gin.Logger())
	router.Use(middleware.CORSMiddleware())

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
