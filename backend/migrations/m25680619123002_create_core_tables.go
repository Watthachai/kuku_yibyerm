// migrations/m25680619123002_create_core_tables.go
package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123002CreateCoreTables = &gormigrate.Migration{
	ID: "25680619123002_create_core_tables",
	Migrate: func(tx *gorm.DB) error {
		return tx.AutoMigrate(&models.Category{}, &models.Department{})
	},
	Rollback: func(tx *gorm.DB) error {
		return tx.Migrator().DropTable("categories", "departments")
	},
}
