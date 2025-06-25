package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123002CreateCoreTables = &gormigrate.Migration{
	ID: "25680619123002_create_core_tables",
	Migrate: func(tx *gorm.DB) error {
		// สร้างตารางแยกกันเพื่อให้แน่ใจว่าสร้างครบ
		if err := tx.AutoMigrate(&models.Category{}); err != nil {
			return err
		}

		if err := tx.AutoMigrate(&models.Department{}); err != nil {
			return err
		}

		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		// ลบในลำดับที่ถูกต้อง (ลบ foreign key ก่อน)
		if err := tx.Migrator().DropTable("departments"); err != nil {
			return err
		}
		if err := tx.Migrator().DropTable("categories"); err != nil {
			return err
		}
		return nil
	},
}
