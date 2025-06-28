package main

import (
	"ku-asset/controllers"
	"ku-asset/database"
	"ku-asset/middleware" // 👈 1. เพิ่ม import ของ middleware
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

	router := gin.Default() // gin.Default() มี Logger ให้อยู่แล้ว

	// -----------------------------------------------------------
	// ✅ 2. แก้ไขตรงนี้: เรียกใช้ Middleware จากส่วนกลางที่เดียว
	router.Use(middleware.CORSMiddleware())
	// -----------------------------------------------------------

	// 3. ไม่จำเป็นต้องเรียก router.Use(gin.Logger()) อีก เพราะ gin.Default() มีให้แล้ว

	services := services.NewServices(db)
	controllers := controllers.NewControllers(services)
	routes.SetupRoutes(router, controllers) // SetupRoutes ยังคงเรียกเหมือนเดิม

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
