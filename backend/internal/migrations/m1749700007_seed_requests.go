package migrations

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/go-faker/faker/v4"
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700007SeedRequests() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "m1749700007_seed_requests",
		Migrate: func(tx *gorm.DB) error {
			rand.Seed(time.Now().UnixNano())

			// Get user IDs for requests
			var userIDs []string
			if err := tx.Table("users").Where("role = ?", "USER").Pluck("id", &userIDs).Error; err != nil {
				return fmt.Errorf("failed to get user IDs: %w", err)
			}

			// Get product IDs for request items
			var productIDs []string
			if err := tx.Table("products").Where("is_active = ?", true).Pluck("id", &productIDs).Error; err != nil {
				return fmt.Errorf("failed to get product IDs: %w", err)
			}

			statuses := []string{"PENDING", "APPROVED", "REJECTED", "ISSUED", "COMPLETED"}
			priorities := []string{"LOW", "NORMAL", "HIGH", "URGENT"}

			purposes := []string{
				"ใช้ในการเรียนการสอน",
				"กิจกรรมนักศึกษา",
				"งานวิจัย",
				"การประชุมสัมมนา",
				"งานบริการวิชาการ",
				"งานอบรมเชิงปฏิบัติการ",
				"จัดแสดงนิทรรศการ",
				"การนำเสนอผลงาน",
			}

			// Generate 100 fake requests
			for i := 0; i < 100; i++ {
				requestDate := time.Now().AddDate(0, -rand.Intn(6), -rand.Intn(30))
				requiredDate := requestDate.AddDate(0, 0, rand.Intn(30)+1)
				status := statuses[rand.Intn(len(statuses))]

				var approvedDate, issuedDate, completedDate *time.Time

				// Set dates based on status
				if status != "PENDING" && status != "REJECTED" {
					approved := requestDate.AddDate(0, 0, rand.Intn(3)+1)
					approvedDate = &approved

					if status == "ISSUED" || status == "COMPLETED" {
						issued := approved.AddDate(0, 0, rand.Intn(3)+1)
						issuedDate = &issued

						if status == "COMPLETED" {
							completed := issued.AddDate(0, 0, rand.Intn(7)+1)
							completedDate = &completed
						}
					}
				}

				request := map[string]interface{}{
					"id":             generateID("REQ"),
					"request_number": generateRequestNumber(),
					"user_id":        userIDs[rand.Intn(len(userIDs))],
					"purpose":        purposes[rand.Intn(len(purposes))],
					"notes":          faker.Sentence(),
					"status":         status,
					"priority":       priorities[rand.Intn(len(priorities))],
					"request_date":   requestDate,
					"required_date":  requiredDate,
					"approved_date":  approvedDate,
					"issued_date":    issuedDate,
					"completed_date": completedDate,
					"created_at":     requestDate,
					"updated_at":     time.Now(),
				}

				if err := tx.Table("requests").Create(request).Error; err != nil {
					return fmt.Errorf("failed to seed request: %w", err)
				}

				// Generate 1-5 request items for each request
				itemCount := rand.Intn(5) + 1
				for j := 0; j < itemCount; j++ {
					requestItem := map[string]interface{}{
						"id":         generateID("RIT"),
						"request_id": request["id"],
						"product_id": productIDs[rand.Intn(len(productIDs))],
						"quantity":   rand.Intn(5) + 1,
						"purpose":    purposes[rand.Intn(len(purposes))],
						"notes":      faker.Sentence(),
						"status":     status,
						"issued_qty": 0,
						"created_at": requestDate,
						"updated_at": time.Now(),
					}

					if status == "ISSUED" || status == "COMPLETED" {
						requestItem["issued_qty"] = requestItem["quantity"]
					}

					if err := tx.Table("request_items").Create(requestItem).Error; err != nil {
						return fmt.Errorf("failed to seed request item: %w", err)
					}
				}
			}

			fmt.Printf("✅ Seeded 100 requests with items successfully\n")
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Exec("DELETE FROM request_items").Error; err != nil {
				return err
			}
			return tx.Exec("DELETE FROM requests").Error
		},
	}
}
