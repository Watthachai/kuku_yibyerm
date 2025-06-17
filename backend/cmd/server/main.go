package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"ku-asset/internal/config"
	"ku-asset/internal/controllers"
	"ku-asset/internal/database"
	"ku-asset/internal/routes"
	"ku-asset/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Parse command line flags
	migrate := flag.Bool("migrate", false, "Run database migrations")
	rollback := flag.String("rollback", "", "Rollback to specific migration ID")
	flag.Parse()

	// Load environment variables
	// loadEnv() // ถ้ามี

	// Handle migration commands
	if *migrate {
		fmt.Println("📊 Running migrations...")
		database.ConnectDatabase() // This will run migrations automatically
		fmt.Println("✅ Migrations completed")
		return
	}

	if *rollback != "" {
		fmt.Printf("⏪ Rolling back to migration: %s\n", *rollback)
		database.ConnectDatabase()
		if err := database.RollbackMigration(database.GetDatabase(), *rollback); err != nil {
			log.Fatal("Migration rollback failed:", err)
		}
		fmt.Println("✅ Rollback completed")
		return
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Initialize database
	db, err := database.Connect(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize services
	services := services.NewServices(db)

	// Initialize controllers
	controllers := controllers.NewControllers(services)

	// Setup Gin
	if cfg.Server.Env == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Setup routes
	routes.SetupRoutes(r, controllers)

	// Graceful shutdown
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		log.Println("🛑 Shutting down server...")
		// Close database connection
		if sqlDB, err := db.DB(); err == nil {
			sqlDB.Close()
		}
		os.Exit(0)
	}()

	// Start server
	fmt.Println("🚀 Starting Kuku Yipyerm Backend Server...")
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}


