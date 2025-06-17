package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700005CreateEnums() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "m1749700005_create_enums",
		Migrate: func(tx *gorm.DB) error {
			// Create product status enum
			if err := tx.Exec(`
                DO $$ BEGIN
                    CREATE TYPE product_status AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `).Error; err != nil {
				return err
			}

			// Create request status enum
			if err := tx.Exec(`
                DO $$ BEGIN
                    CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ISSUED', 'COMPLETED');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `).Error; err != nil {
				return err
			}

			// Create request priority enum
			if err := tx.Exec(`
                DO $$ BEGIN
                    CREATE TYPE request_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `).Error; err != nil {
				return err
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Exec("DROP TYPE IF EXISTS product_status CASCADE").Error; err != nil {
				return err
			}
			if err := tx.Exec("DROP TYPE IF EXISTS request_status CASCADE").Error; err != nil {
				return err
			}
			if err := tx.Exec("DROP TYPE IF EXISTS request_priority CASCADE").Error; err != nil {
				return err
			}
			return nil
		},
	}
}
