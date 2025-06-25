// migrations/m25680619123005_create_requests_tables.go
package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123005CreateRequestsTables = &gormigrate.Migration{
	ID: "25680619123005_create_requests_tables",
	Migrate: func(tx *gorm.DB) error {
		return tx.AutoMigrate(&models.Request{}, &models.RequestItem{})
	},
	Rollback: func(tx *gorm.DB) error {
		return tx.Migrator().DropTable("requests", "request_items")
	},
}
