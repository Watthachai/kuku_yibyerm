package main

import (
	"log"
	"os"

	"kuku-yipyerm/internal/config"
	"kuku-yipyerm/internal/models"
	"kuku-yipyerm/internal/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default environment variables")
	}

	// Initialize database connection.
	// The InitDB function now handles its own error logging with log.Fatal.
	config.InitDB()

	// Get the database instance using the GetDB function
	db := config.GetDB()

	// Auto-migrate the schema for the User model
	log.Println("Running database migrations...")
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Setup router
	r := routes.SetupRouter(db)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
