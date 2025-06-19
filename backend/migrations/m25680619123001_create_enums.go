// migrations/m25680619123001_create_enums.go
package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680619123001CreateEnums = &gormigrate.Migration{
	ID: "25680619123001_create_enums",
	Migrate: func(tx *gorm.DB) error {
		enums := []string{
			"CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ISSUED', 'COMPLETED', 'CANCELLED');",
			"CREATE TYPE department_type AS ENUM ('FACULTY', 'DIVISION', 'INSTITUTE', 'CENTER', 'OFFICE');",
			"CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');",
		}
		for _, enum := range enums {
			if err := tx.Exec(enum).Error; err != nil {
				return err
			}
		}
		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		enums := []string{
			"DROP TYPE request_status;",
			"DROP TYPE department_type;",
			"DROP TYPE user_role;",
		}
		for _, enum := range enums {
			if err := tx.Exec(enum).Error; err != nil {
				return err
			}
		}
		return nil
	},
}
