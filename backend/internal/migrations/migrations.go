package migrations

import (
	"time"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

// GetAllMigrations returns all available migrations
func GetAllMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		// Add your existing migrations here
		m1749201982CreateUsersTable(),
		// m1749201983CreateOtherTable(), // Example

		// New OAuth migration
		m1749699695AddOAuthFields(),
	}
}

// Example: Create Users Table Migration
func m1749201982CreateUsersTable() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "1749201982",
		Migrate: func(tx *gorm.DB) error {
			type User struct {
				ID        uint    `gorm:"primaryKey"`
				Email     string  `gorm:"uniqueIndex;not null"`
				Name      string  `gorm:"not null"`
				Password  string  `gorm:"not null"`
				Avatar    *string `gorm:"type:text"`
				Role      string  `gorm:"type:varchar(20);default:'USER'"`
				CreatedAt time.Time
				UpdatedAt time.Time
				DeletedAt gorm.DeletedAt `gorm:"index"`
			}

			return tx.AutoMigrate(&User{})
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Migrator().DropTable("users")
		},
	}
}
