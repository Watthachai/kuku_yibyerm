package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"kuku-yipyerm/internal/app"
	"kuku-yipyerm/internal/database"
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

	// Initialize application
	application, err := app.Initialize()
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}

	// Graceful shutdown
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		log.Println("🛑 Shutting down server...")
		if err := application.Shutdown(); err != nil {
			log.Printf("Error during shutdown: %v", err)
		}
		os.Exit(0)
	}()

	// Start server
	fmt.Println("🚀 Starting Kuku Yipyerm Backend Server...")
	if err := application.Run(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
