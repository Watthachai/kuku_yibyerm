package database

import (
	"kuku-yipyerm/internal/models"

	"gorm.io/gorm"
)

// AutoMigrate runs automatic migrations for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		// Add other models here
	)
}
