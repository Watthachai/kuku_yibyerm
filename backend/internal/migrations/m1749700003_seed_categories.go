package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700003SeedCategories() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "m1749700003_seed_categories",
		Migrate: func(tx *gorm.DB) error {
			categories := []map[string]interface{}{
				{
					"id": "1", "name": "อุปกรณ์โสตทัศนูปกรณ์", "description": "เครื่องฉาย ไมโครโฟน ลำโพง",
					"icon": "📽️", "color": "bg-blue-100 text-blue-800", "is_active": true,
				},
				{
					"id": "2", "name": "อุปกรณ์สำนักงาน", "description": "เครื่องพิมพ์ เครื่องสแกน เครื่องถ่ายเอกสาร",
					"icon": "🖨️", "color": "bg-green-100 text-green-800", "is_active": true,
				},
				{
					"id": "3", "name": "อุปกรณ์ถ่ายภาพ", "description": "กล้องถ่ายรูป กล้องวีดีโอ ขาตั้งกล้อง",
					"icon": "📷", "color": "bg-purple-100 text-purple-800", "is_active": true,
				},
				{
					"id": "4", "name": "อุปกรณ์คอมพิวเตอร์", "description": "แล็ปท็อป เดสก์ท็อป แท็บเล็ต",
					"icon": "💻", "color": "bg-orange-100 text-orange-800", "is_active": true,
				},
				{
					"id": "5", "name": "อุปกรณ์ไฟฟ้า", "description": "ปลั๊กพ่วง สายไฟ ถ่าน อแดปเตอร์",
					"icon": "🔌", "color": "bg-yellow-100 text-yellow-800", "is_active": true,
				},
				{
					"id": "6", "name": "เครื่องเขียน", "description": "ปากกา กระดาษ ไฟล์ อุปกรณ์เขียน",
					"icon": "✏️", "color": "bg-pink-100 text-pink-800", "is_active": true,
				},
			}

			for _, category := range categories {
				if err := tx.Table("categories").Create(category).Error; err != nil {
					return err
				}
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec("DELETE FROM categories").Error
		},
	}
}
