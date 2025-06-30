package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680623001AddProductFields = &gormigrate.Migration{
	ID: "25680623001_add_product_fields",
	Migrate: func(tx *gorm.DB) error {
		// ⭐ เพิ่มฟิลด์ใหม่ใน products table
		if err := tx.Exec(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS code VARCHAR(50),
            ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'ชิ้น',
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE'
        `).Error; err != nil {
			return err
		}

		// ⭐ เพิ่ม unique constraint สำหรับ code (หลังจากอัปเดตข้อมูลแล้ว)
		if err := tx.Exec(`
            CREATE INDEX IF NOT EXISTS idx_products_code ON products(code)
        `).Error; err != nil {
			return err
		}

		// ⭐ สร้าง index อื่นๆ
		if err := tx.Exec(`
            CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)
        `).Error; err != nil {
			return err
		}

		if err := tx.Exec(`
            CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)
        `).Error; err != nil {
			return err
		}

		// ⭐ อัปเดตข้อมูลเก่าที่ยังไม่มี code
		if err := tx.Exec(`
            UPDATE products SET 
                code = CONCAT('PRD', LPAD(id::text, 4, '0')),
                stock = COALESCE(stock, 100),
                min_stock = COALESCE(min_stock, 10),
                unit = COALESCE(unit, 'ชิ้น'),
                status = COALESCE(status, 'ACTIVE')
            WHERE code IS NULL OR code = ''
        `).Error; err != nil {
			return err
		}

		// ⭐ เพิ่ม unique constraint หลังจากอัปเดตข้อมูลแล้ว
		if err := tx.Exec(`
            ALTER TABLE products 
            ADD CONSTRAINT unique_products_code UNIQUE (code)
        `).Error; err != nil {
			// ถ้า constraint มีอยู่แล้ว จะไม่ error
			return nil
		}

		// ⭐ เพิ่ม NOT NULL constraint
		if err := tx.Exec(`
            ALTER TABLE products 
            ALTER COLUMN stock SET NOT NULL,
            ALTER COLUMN unit SET NOT NULL,
            ALTER COLUMN status SET NOT NULL
        `).Error; err != nil {
			return err
		}

		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		// ⭐ ลบ constraints และ indexes ก่อน
		tx.Exec(`DROP INDEX IF EXISTS idx_products_code`)
		tx.Exec(`DROP INDEX IF EXISTS idx_products_stock`)
		tx.Exec(`DROP INDEX IF EXISTS idx_products_status`)
		tx.Exec(`ALTER TABLE products DROP CONSTRAINT IF EXISTS unique_products_code`)

		// ⭐ ลบฟิลด์ที่เพิ่มเข้ามา
		return tx.Exec(`
            ALTER TABLE products 
            DROP COLUMN IF EXISTS code,
            DROP COLUMN IF EXISTS stock,
            DROP COLUMN IF EXISTS min_stock,
            DROP COLUMN IF EXISTS unit,
            DROP COLUMN IF EXISTS status
        `).Error
	},
}
