package migrations

import (
	"kuku-yipyerm/internal/models"

	"github.com/go-gormigrate/gormigrate/v2"

	"gorm.io/gorm"
)

// AutoMigrate runs automatic migrations for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Department{},
		&models.User{},
		// เพิ่ม models อื่นๆ ตรงนี้
	)
}

// CreateTables creates all tables manually (alternative to AutoMigrate)
func CreateTables(db *gorm.DB) error {
	// Create departments table first (foreign key dependency)
	if err := db.AutoMigrate(&models.Department{}); err != nil {
		return err
	}

	// Create users table
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return err
	}

	return nil
}

// GetAllMigrations returns all migrations in chronological order
func GetAllMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		m1749700000CreateDepartmentsTable(),
		m1749700001AddDepartmentToUsers(),
		m1749700002SeedDepartments(),
	}
}
