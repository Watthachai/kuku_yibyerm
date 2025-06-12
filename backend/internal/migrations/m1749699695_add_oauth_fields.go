package migrations

import (
	"kuku-yipyerm/internal/models"
	"time"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749699695AddOAuthFields() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "1749699695",
		Migrate: func(tx *gorm.DB) error {
			// ใช้ AutoMigrate เพื่อให้ GORM จัดการ schema changes
			type User struct {
				ID         uint    `gorm:"primaryKey"`
				Email      string  `gorm:"uniqueIndex;not null"`
				Name       string  `gorm:"not null"`
				Password   *string `gorm:"type:varchar(255)"` // Nullable for OAuth
				Avatar     *string `gorm:"type:text"`
				Role       string  `gorm:"type:varchar(20);default:'USER'"`
				Provider   string  `gorm:"type:varchar(50);default:'local'"` // New field
				ProviderID *string `gorm:"type:varchar(255)"`                // New field
				CreatedAt  time.Time
				UpdatedAt  time.Time
				DeletedAt  gorm.DeletedAt `gorm:"index"`
			}

			// Add the new columns
			if err := tx.AutoMigrate(&User{}); err != nil {
				return err
			}

			// Add unique constraint for provider + provider_id
			if err := tx.Exec(`
                ALTER TABLE users 
                ADD CONSTRAINT IF NOT EXISTS unique_provider_id 
                UNIQUE (provider, provider_id)
            `).Error; err != nil {
				return err
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			// Remove the added columns and constraints
			if err := tx.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_provider_id").Error; err != nil {
				return err
			}

			if err := tx.Migrator().DropColumn(&models.User{}, "provider"); err != nil {
				return err
			}

			if err := tx.Migrator().DropColumn(&models.User{}, "provider_id"); err != nil {
				return err
			}

			// Make password NOT NULL again (optional, depends on your needs)
			// if err := tx.Exec("ALTER TABLE users ALTER COLUMN password SET NOT NULL").Error; err != nil {
			//     return err
			// }

			return nil
		},
	}
}
