package main

import (
	"flag"
	"fmt"
	"log"

	"ku-asset/database"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Define flags
	var (
		action = flag.String("action", "migrate", "Action to perform: migrate, rollback, status")
		target = flag.String("target", "", "Target migration ID for rollback")
	)
	flag.Parse()

	// Connect to database
	database.ConnectDatabase()
	db := database.GetDatabase()

	switch *action {
	case "migrate":
		log.Println("Running migrations...")
		if err := database.RunMigrations(db); err != nil {
			log.Fatal("Migration failed:", err)
		}
		log.Println("✅ All migrations completed successfully")

	case "rollback":
		if *target == "" {
			log.Fatal("Target migration ID is required for rollback")
		}
		log.Printf("Rolling back to migration: %s", *target)
		if err := database.RollbackMigration(db, *target); err != nil {
			log.Fatal("Rollback failed:", err)
		}
		log.Println("✅ Rollback completed successfully")

	case "status":
		log.Println("📊 Migration status:")
		// You can implement migration status checking here
		fmt.Println("Feature coming soon...")

	default:
		log.Fatal("Invalid action. Use: migrate, rollback, or status")
	}
}
