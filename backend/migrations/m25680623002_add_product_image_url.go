package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680623002AddProductImageURL = &gormigrate.Migration{
	ID: "25680623002_add_product_image_url",
	Migrate: func(tx *gorm.DB) error {
		// ⭐ เพิ่ม image_url column ให้ products table
		if err := tx.Exec(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)
        `).Error; err != nil {
			return err
		}

		// ⭐ เพิ่ม index เพื่อความเร็ว (optional)
		if err := tx.Exec(`
            CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url)
        `).Error; err != nil {
			return err
		}

		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		// ⭐ ลบ index และ column
		tx.Exec(`DROP INDEX IF EXISTS idx_products_image_url`)
		return tx.Exec(`
            ALTER TABLE products 
            DROP COLUMN IF EXISTS image_url
        `).Error
	},
}
