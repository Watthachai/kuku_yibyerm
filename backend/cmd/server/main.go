// main.go
package main

import (
	"ku-asset/controllers"
	"ku-asset/database"
	"ku-asset/migrations" // 👈 import migration
	"ku-asset/routes"
	"ku-asset/services"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	log.Println("🚀 Starting Kuku Yipyerm Backend Server...")

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	} else {
		log.Println("✅ .env file loaded successfully")
	}

	dbConfig := database.NewConfigFromEnv()
	db, err := database.Connect(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	log.Println("✅ Database connected successfully")

	// ⭐ Run migrations using the new system
	if err := migrations.RunMigrations(db); err != nil {
		log.Fatalf("Could not run migrations: %v", err)
	}

	// --- ส่วนที่เหลือเหมือนเดิม ---
	ginMode := getEnv("GIN_MODE", "debug")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	router.Use(gin.Logger())

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
