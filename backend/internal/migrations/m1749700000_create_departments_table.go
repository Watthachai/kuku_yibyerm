package migrations

import (
	"time"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700000CreateDepartmentsTable() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "1749700000",
		Migrate: func(tx *gorm.DB) error {
			type Department struct {
				ID          uint    `gorm:"primaryKey"`
				Code        string  `gorm:"uniqueIndex;size:20;not null"`
				NameTH      string  `gorm:"size:255;not null"`
				NameEN      string  `gorm:"size:255"`
				Type        string  `gorm:"type:varchar(20);default:'FACULTY'"`
				ParentID    *uint   `gorm:"index"`
				IsActive    bool    `gorm:"default:true"`
				Description *string `gorm:"type:text"`
				CreatedAt   time.Time
				UpdatedAt   time.Time
				DeletedAt   gorm.DeletedAt `gorm:"index"`
			}

			if err := tx.AutoMigrate(&Department{}); err != nil {
				return err
			}

			// Add foreign key constraint
			if err := tx.Exec(`
                ALTER TABLE departments 
                ADD CONSTRAINT fk_departments_parent 
                FOREIGN KEY (parent_id) REFERENCES departments(id) 
                ON DELETE SET NULL
            `).Error; err != nil {
				return err
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec("DROP TABLE IF EXISTS departments").Error
		},
	}
}
