// migrations/m25680619123004_create_assets_table.go
package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123004CreateAssetsTable = &gormigrate.Migration{
	ID: "25680619123004_create_assets_table",
	Migrate: func(tx *gorm.DB) error {
		return tx.AutoMigrate(&models.Asset{})
	},
	Rollback: func(tx *gorm.DB) error {
		return tx.Migrator().DropTable("assets")
	},
}
