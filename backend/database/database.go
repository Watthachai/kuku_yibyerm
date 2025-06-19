package database

import (
	"fmt"
	"log"
	"os"

	"ku-asset/migrations"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error

	// Database configuration
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// Connect to database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("✅ Database connected successfully")

	// Run migrations
	if err := RunMigrations(DB); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("✅ Migrations completed successfully")
}

func RunMigrations(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrations.GetAllMigrations())

	// Run migrations
	if err := m.Migrate(); err != nil {
		return fmt.Errorf("could not migrate: %v", err)
	}

	log.Println("Migration ran successfully")
	return nil
}

// RollbackMigration rolls back to a specific migration
func RollbackMigration(db *gorm.DB, migrationID string) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrations.GetAllMigrations())

	if err := m.RollbackTo(migrationID); err != nil {
		return fmt.Errorf("could not rollback migration: %v", err)
	}

	log.Printf("Rollback to migration %s completed successfully", migrationID)
	return nil
}

// GetDatabase returns the database instance
func GetDatabase() *gorm.DB {
	return DB
}
