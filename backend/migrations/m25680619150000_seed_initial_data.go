package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

var M25680619150000SeedInitialData = &gormigrate.Migration{
	ID: "25680619150000_seed_initial_data",
	Migrate: func(tx *gorm.DB) error {
		// --- 1. สร้าง Categories ---
		categories := []models.Category{
			{Name: "อุปกรณ์สำนักงาน", Description: "อุปกรณ์สำหรับใช้ในสำนักงานทั่วไป", IsActive: true},
			{Name: "อุปกรณ์ไอทีและคอมพิวเตอร์", Description: "คอมพิวเตอร์และอุปกรณ์ต่อพ่วง", IsActive: true},
			{Name: "อุปกรณ์โสตทัศนูปกรณ์", Description: "อุปกรณ์สำหรับงานนำเสนอและสื่อต่างๆ", IsActive: true},
		}
		if err := tx.Create(&categories).Error; err != nil {
			return err
		}

		// --- 2. สร้าง Products (โดยกำหนดค่าทุก Field ที่มีใน struct) ---
		products := []models.Product{
			{Name: "เครื่องฉายภาพ Epson EB-X41", Brand: stringPtr("Epson"), ProductModel: stringPtr("EB-X41"), CategoryID: categories[2].ID, TrackingMethod: models.TrackByItem},
			{Name: "เครื่องพิมพ์ HP LaserJet Pro M404dn", Brand: stringPtr("HP"), ProductModel: stringPtr("M404dn"), CategoryID: categories[1].ID, TrackingMethod: models.TrackByItem},
			{Name: "Notebook Dell Latitude 5420", Brand: stringPtr("Dell"), ProductModel: stringPtr("Latitude 5420"), CategoryID: categories[1].ID, TrackingMethod: models.TrackByItem},
			{Name: "ปากกาลูกลื่น Lancer", Brand: stringPtr("Lancer"), ProductModel: stringPtr("Spirit"), CategoryID: categories[0].ID, TrackingMethod: models.TrackByQuantity}, // ⭐ ตัวอย่างวัสดุสิ้นเปลือง
		}
		if err := tx.Create(&products).Error; err != nil {
			return err
		}

		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		tx.Exec("DELETE FROM products")
		tx.Exec("DELETE FROM categories")
		return nil
	},
}
