// migrations/migrations.go
package migrations

import (
	"log"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

// ⭐ สร้างฟังก์ชันนี้ให้เป็น Public (ขึ้นต้นด้วยตัวใหญ่)
// GetAllMigrations returns all the migrations in the order they should be run.
func GetAllMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		M25680619123001CreateEnums,
		M25680619123002CreateCoreTables,
		M25680619123003CreateUsersAndProductsTables,
		M25680619123004CreateAssetsTable,
		M25680619123005CreateRequestsTables,
	}
}

// เราสามารถย้ายฟังก์ชัน RunMigrations มาไว้ที่นี่เพื่อให้จัดการง่ายขึ้นได้
// แต่เพื่อให้สอดคล้องกับโค้ดของคุณ เราจะปล่อยให้ฟังก์ชันนี้ว่างไว้ก่อน
// และให้ `database.go` เป็นตัวจัดการการรัน
func RunMigrations(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, GetAllMigrations())

	log.Println("Running database migrations from migrations package...")
	if err := m.Migrate(); err != nil {
		log.Printf("Could not migrate: %v", err)
		return err
	}

	log.Println("✅ Migration successful from migrations package")
	return nil
}
