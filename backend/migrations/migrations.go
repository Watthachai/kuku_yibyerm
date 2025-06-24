package migrations

import (
	"log"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

// GetAllMigrations returns all the migrations in the order they should be run.
func GetAllMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		M25680619123001CreateEnums,                  // 1. สร้าง Enums ก่อน
		M25680619123002CreateCoreTables,             // 2. สร้างตาราง Core (categories, departments)
		M25680619123003CreateUsersAndProductsTables, // 3. สร้างตาราง Users และ Products
		M25680623001AddProductFields,                // 4. ⭐ เพิ่มฟิลด์ Product ใหม่
		M25680623002AddProductImageURL,              // 5. ⭐ เพิ่ม ImageURL field
		M25680619123005CreateRequestsTables,         // 6. สร้างตาราง Requests
		M25680621173000SeedCoreData,                 // 7. Seed ข้อมูลสุดท้าย
		M25680624001SeedFacultiesAndDepartments,     // 8. 🆕 Seed Faculty และ Department data
	}
}

// RunMigrations runs all migrations
func RunMigrations(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, GetAllMigrations())

	log.Println("🔄 Running database migrations...")

	if err := m.Migrate(); err != nil {
		log.Printf("❌ Migration failed: %v", err)
		return err
	}

	log.Println("✅ All migrations completed successfully")
	return nil
}
