package migrations

import (
	"fmt"
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680621173000SeedCoreData = &gormigrate.Migration{
	ID: "25680621173000_seed_core_data",
	Migrate: func(tx *gorm.DB) error {
		// ตรวจสอบว่าตารางมีอยู่จริงก่อน
		if !tx.Migrator().HasTable(&models.Category{}) {
			return fmt.Errorf("categories table does not exist")
		}

		if !tx.Migrator().HasTable(&models.Department{}) {
			return fmt.Errorf("departments table does not exist")
		}

		// ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
		var count int64
		tx.Model(&models.Category{}).Count(&count)
		if count > 0 {
			return nil // มีข้อมูลแล้ว ไม่ต้อง seed
		}

		// Seed categories
		categories := []models.Category{
			{Name: "ครุภัณฑ์สำนักงาน", IsActive: true},
			{Name: "ครุภัณฑ์คอมพิวเตอร์", IsActive: true},
			{Name: "ครุภัณฑ์การศึกษา", IsActive: true},
		}

		return tx.Create(&categories).Error
	},
	Rollback: func(tx *gorm.DB) error {
		return tx.Exec("DELETE FROM categories WHERE name IN (?, ?, ?)",
			"ครุภัณฑ์สำนักงาน", "ครุภัณฑ์คอมพิวเตอร์", "ครุภัณฑ์การศึกษา").Error
	},
}
