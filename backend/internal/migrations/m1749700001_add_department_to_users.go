package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700001AddDepartmentToUsers() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "1749700001",
		Migrate: func(tx *gorm.DB) error {
			// Add department_id column to users table
			if err := tx.Exec(`
                ALTER TABLE users 
                ADD COLUMN department_id INTEGER,
                ADD COLUMN phone VARCHAR(20)
            `).Error; err != nil {
				return err
			}

			// Add index for department_id
			if err := tx.Exec(`
                CREATE INDEX idx_users_department_id ON users(department_id)
            `).Error; err != nil {
				return err
			}

			// Add foreign key constraint
			if err := tx.Exec(`
                ALTER TABLE users 
                ADD CONSTRAINT fk_users_department 
                FOREIGN KEY (department_id) REFERENCES departments(id) 
                ON DELETE SET NULL
            `).Error; err != nil {
				return err
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
                ALTER TABLE users 
                DROP CONSTRAINT IF EXISTS fk_users_department,
                DROP COLUMN IF EXISTS department_id,
                DROP COLUMN IF EXISTS phone
            `).Error
		},
	}
}
