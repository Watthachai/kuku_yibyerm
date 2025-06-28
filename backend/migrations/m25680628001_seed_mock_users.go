package migrations

import (
	"ku-asset/models"
	"log"

	"github.com/go-gormigrate/gormigrate/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// M25680628001_seed_mock_users creates mock users for testing
var M25680628001_seed_mock_users = &gormigrate.Migration{
	ID: "25680628001_seed_mock_users",
	Migrate: func(tx *gorm.DB) error {
		log.Println("🔄 Creating mock users...")

		// Hash password function
		hashPassword := func(password string) string {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Error hashing password: %v", err)
				return ""
			}
			return string(hashedPassword)
		}

		// Mock users data
		adminPassword := hashPassword("admin123")
		userPassword := hashPassword("user123")

		adminDeptID := uint(1)
		userDeptID := uint(2)

		mockUsers := []models.User{
			{
				Email:        "admin@ku.ac.th",
				Name:         "ผู้ดูแลระบบ KU Asset",
				Password:     &adminPassword,
				Role:         models.RoleAdmin,
				Provider:     "local",
				IsActive:     true,
				DepartmentID: &adminDeptID, // คณะเกษตร
			},
			{
				Email:        "user@ku.ac.th",
				Name:         "นักศึกษา KU Asset",
				Password:     &userPassword,
				Role:         models.RoleUser,
				Provider:     "local",
				IsActive:     true,
				DepartmentID: &userDeptID, // คณะวิศวกรรมศาสตร์
			},
		}

		// Insert mock users
		for _, user := range mockUsers {
			// Check if user already exists
			var existingUser models.User
			if err := tx.Where("email = ?", user.Email).First(&existingUser).Error; err == gorm.ErrRecordNotFound {
				// User doesn't exist, create it
				if err := tx.Create(&user).Error; err != nil {
					log.Printf("❌ Error creating user %s: %v", user.Email, err)
					return err
				}
				log.Printf("✅ Created mock user: %s (%s)", user.Email, user.Role)
			} else {
				log.Printf("⚠️ User %s already exists, skipping...", user.Email)
			}
		}

		log.Println("✅ Mock users migration completed!")
		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		log.Println("🔄 Rolling back mock users...")

		// Delete mock users
		mockEmails := []string{"admin@ku.ac.th", "user@ku.ac.th"}
		for _, email := range mockEmails {
			if err := tx.Where("email = ?", email).Delete(&models.User{}).Error; err != nil {
				log.Printf("❌ Error deleting user %s: %v", email, err)
				return err
			}
			log.Printf("✅ Deleted mock user: %s", email)
		}

		log.Println("✅ Mock users rollback completed!")
		return nil
	},
}
