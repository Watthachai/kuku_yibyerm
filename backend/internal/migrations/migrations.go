package migrations

import (
	"kuku-yipyerm/internal/models"

	"github.com/go-gormigrate/gormigrate/v2"

	"gorm.io/gorm"
)

// AutoMigrate runs automatic migrations for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		// เพิ่ม models อื่นๆ ตรงนี้
	)
}

// CreateTables creates all tables manually (alternative to AutoMigrate)
func CreateTables(db *gorm.DB) error {
	// Create users table
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return err
	}

	// Add any custom table modifications here

	return nil
}

// GetAllMigrations returns all migrations in chronological order
func GetAllMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		// Migration files will be added here
		// Example:
		// Migration20250612120000, // create_users_table
		// Migration20250612120001, // create_posts_table
	}
}
