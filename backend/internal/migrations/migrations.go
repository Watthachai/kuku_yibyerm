package migrations

import (
	"ku-asset/internal/models"

	"github.com/go-gormigrate/gormigrate/v2"

	"gorm.io/gorm"
)

// AutoMigrate runs automatic migrations for all models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Department{},
		&models.Category{},
		&models.Product{},
		&models.User{},
		&models.Request{},
		&models.RequestItem{},
	)
}

// CreateTables creates all tables manually (alternative to AutoMigrate)
func CreateTables(db *gorm.DB) error {
	// Create departments table first (foreign key dependency)
	if err := db.AutoMigrate(&models.Department{}); err != nil {
		return err
	}

	// Create categories table
	if err := db.AutoMigrate(&models.Category{}); err != nil {
		return err
	}

	// Create products table (depends on categories and departments)
	if err := db.AutoMigrate(&models.Product{}); err != nil {
		return err
	}

	// Create users table
	if err := db.AutoMigrate(&models.User{}); err != nil {
		return err
	}

	// Create requests table
	if err := db.AutoMigrate(&models.Request{}); err != nil {
		return err
	}

	// Create request_items table
	if err := db.AutoMigrate(&models.RequestItem{}); err != nil {
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
		m1749700003SeedCategories(),
		m1749700005CreateEnums(),
		m1749700004SeedProducts(), // ใช้ Faker
		m1749700006SeedUsers(),    // ใช้ Faker
		m1749700007SeedRequests(), // ใช้ Faker
	}
}
