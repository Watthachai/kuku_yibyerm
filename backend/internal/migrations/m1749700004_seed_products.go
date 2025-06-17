package migrations

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700004SeedProducts() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "m1749700004_seed_products",
		Migrate: func(tx *gorm.DB) error {
			rand.Seed(time.Now().UnixNano())

			var products []map[string]interface{}

			// Categories with their prefixes and counts
			categories := []struct {
				ID     string
				Prefix string
				Count  int
				DeptID string
			}{
				{"1", "EP", 8, "1"},      // อุปกรณ์โสตทัศนูปกรณ์
				{"2", "HP", 10, "2"},     // อุปกรณ์สำนักงาน
				{"3", "CM", 6, "4"},      // อุปกรณ์ถ่ายภาพ
				{"4", "CP", 12, "4"},     // อุปกรณ์คอมพิวเตอร์
				{"5", "EL", 15, "4"},     // อุปกรณ์ไฟฟ้า
				{"6", "ST", 20, "ADMIN"}, // เครื่องเขียน
			}

			// Generate products for each category
			for _, cat := range categories {
				for i := 1; i <= cat.Count; i++ {
					fakeData := GenerateFakeProduct(cat.Prefix, i)

					// Random status distribution
					statuses := []string{"AVAILABLE", "AVAILABLE", "AVAILABLE", "IN_USE", "MAINTENANCE"}
					status := statuses[rand.Intn(len(statuses))]

					totalQty := rand.Intn(20) + 5 // 5-25 ชิ้น
					availableQty := totalQty

					if status != "AVAILABLE" {
						availableQty = rand.Intn(totalQty) // ลดจำนวนที่มี
					}

					// Random dates
					purchaseDate := time.Now().AddDate(-rand.Intn(3), -rand.Intn(12), -rand.Intn(30))
					warrantyEnd := purchaseDate.AddDate(rand.Intn(3)+1, 0, 0) // 1-3 ปี warranty

					product := map[string]interface{}{
						"code":               fakeData.Code,
						"name":               fakeData.Name,
						"description":        fakeData.Description,
						"category_id":        cat.ID,
						"department_id":      cat.DeptID,
						"status":             status,
						"total_quantity":     totalQty,
						"available_quantity": availableQty,
						"location":           fakeData.Location,
						"price":              fakeData.Price,
						"purchase_date":      purchaseDate,
						"warranty_end":       warrantyEnd,
						"rating":             float64(rand.Intn(20)+35) / 10.0, // 3.5-5.0
						"borrow_count":       rand.Intn(500),
						"is_active":          true,
						"created_at":         time.Now(),
						"updated_at":         time.Now(),
					}

					products = append(products, product)
				}
			}

			// Insert all products
			for _, product := range products {
				if err := tx.Table("products").Create(product).Error; err != nil {
					return fmt.Errorf("failed to seed product %s: %w", product["code"], err)
				}
			}

			fmt.Printf("✅ Seeded %d products successfully\n", len(products))
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec("DELETE FROM products").Error
		},
	}
}
