package migrations

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/go-gormigrate/gormigrate/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func m1749700006SeedUsers() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "m1749700006_seed_users",
		Migrate: func(tx *gorm.DB) error {
			rand.Seed(time.Now().UnixNano())

			// Hash password for all fake users
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
			if err != nil {
				return fmt.Errorf("failed to hash password: %w", err)
			}

			var users []map[string]interface{}

			// Get department IDs for random assignment
			departments := []string{"1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "ADMIN"}
			roles := []string{"USER", "USER", "USER", "USER", "ADMIN"} // 80% users, 20% admins

			// Create admin user
			adminUser := map[string]interface{}{
				"email":         "admin@ku.ac.th",
				"password":      string(hashedPassword),
				"first_name":    "ผู้ดูแล",
				"last_name":     "ระบบ",
				"role":          "ADMIN",
				"phone":         "02-942-8200",
				"student_id":    nil,
				"employee_id":   "EMP000001",
				"department_id": "ADMIN",
				"gender":        "male",
				"birth_date":    time.Date(1980, 1, 1, 0, 0, 0, 0, time.UTC),
				"address":       "มหาวิทยาลัยเกษตรศาสตร์ บางเขน กรุงเทพฯ",
				"is_active":     true,
				"verified_at":   time.Now(),
				"created_at":    time.Now(),
				"updated_at":    time.Now(),
			}
			users = append(users, adminUser)

			// Create test user
			testUser := map[string]interface{}{
				"email":         "user@ku.ac.th",
				"password":      string(hashedPassword),
				"first_name":    "ทดสอบ",
				"last_name":     "ระบบ",
				"role":          "USER",
				"phone":         "08-1234-5678",
				"student_id":    "6310450001",
				"employee_id":   nil,
				"department_id": "1",
				"gender":        "female",
				"birth_date":    time.Date(2001, 5, 15, 0, 0, 0, 0, time.UTC),
				"address":       "หอพักนักศึกษา มหาวิทยาลัยเกษตรศาสตร์",
				"is_active":     true,
				"verified_at":   time.Now(),
				"created_at":    time.Now(),
				"updated_at":    time.Now(),
			}
			users = append(users, testUser)

			// Generate 50 fake users
			for i := 0; i < 50; i++ {
				fakeUser := GenerateFakeUser()
				role := roles[rand.Intn(len(roles))]

				user := map[string]interface{}{
					"email":         fakeUser["email"],
					"password":      string(hashedPassword),
					"first_name":    fakeUser["first_name"],
					"last_name":     fakeUser["last_name"],
					"role":          role,
					"phone":         fakeUser["phone"],
					"gender":        fakeUser["gender"],
					"birth_date":    fakeUser["birth_date"],
					"address":       fakeUser["address"],
					"department_id": departments[rand.Intn(len(departments))],
					"is_active":     true,
					"verified_at":   time.Now(),
					"created_at":    fakeUser["created_at"],
					"updated_at":    fakeUser["updated_at"],
				}

				// Assign student_id or employee_id based on role
				if role == "USER" && rand.Float32() < 0.7 { // 70% students
					user["student_id"] = fakeUser["student_id"]
					user["employee_id"] = nil
				} else {
					user["student_id"] = nil
					user["employee_id"] = fakeUser["employee_id"]
				}

				users = append(users, user)
			}

			// Insert all users
			for _, user := range users {
				if err := tx.Table("users").Create(user).Error; err != nil {
					return fmt.Errorf("failed to seed user %s: %w", user["email"], err)
				}
			}

			fmt.Printf("✅ Seeded %d users successfully\n", len(users))
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec("DELETE FROM users WHERE email != 'admin@ku.ac.th'").Error
		},
	}
}
