// migrations/m25680619123003_create_users_and_products_tables.go
package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123003CreateUsersAndProductsTables = &gormigrate.Migration{
	ID: "25680619123003_create_users_and_products_tables",
	Migrate: func(tx *gorm.DB) error {
		return tx.AutoMigrate(&models.User{}, &models.Product{})
	},
	Rollback: func(tx *gorm.DB) error {
		return tx.Migrator().DropTable("users", "products")
	},
}
