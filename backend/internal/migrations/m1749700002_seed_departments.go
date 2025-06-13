package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func m1749700002SeedDepartments() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "1749700002",
		Migrate: func(tx *gorm.DB) error {
			departments := []map[string]interface{}{
				{
					"code": "AGRI", "name_th": "คณะเกษตร", "name_en": "Faculty of Agriculture",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "ENG", "name_th": "คณะวิศวกรรมศาสตร์", "name_en": "Faculty of Engineering",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "SCI", "name_th": "คณะวิทยาศาสตร์", "name_en": "Faculty of Science",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "FOR", "name_th": "คณะวนศาสตร์", "name_en": "Faculty of Forestry",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "FISH", "name_th": "คณะประมง", "name_en": "Faculty of Fisheries",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "ECON", "name_th": "คณะเศรษฐศาสตร์", "name_en": "Faculty of Economics",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "HUM", "name_th": "คณะมนุษยศาสตร์", "name_en": "Faculty of Humanities",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "SOC", "name_th": "คณะสังคมศาสตร์", "name_en": "Faculty of Social Sciences",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "EDU", "name_th": "คณะศึกษาศาสตร์", "name_en": "Faculty of Education",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "VET", "name_th": "คณะสัตวแพทยศาสตร์", "name_en": "Faculty of Veterinary Medicine",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "AGRO", "name_th": "คณะอุตสาหกรรมเกษตร", "name_en": "Faculty of Agro-Industry",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "ENV", "name_th": "คณะสิ่งแวดล้อม", "name_en": "Faculty of Environment",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "ARCH", "name_th": "คณะสถาปัตยกรรมศาสตร์", "name_en": "Faculty of Architecture",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "BBA", "name_th": "คณะบริหารธุรกิจ", "name_en": "Faculty of Business Administration",
					"type": "FACULTY", "is_active": true,
				},
				{
					"code": "LA", "name_th": "วิทยาลัยศิลปศาสตร์", "name_en": "College of Liberal Arts",
					"type": "INSTITUTE", "is_active": true,
				},
				{
					"code": "ADMIN", "name_th": "สำนักงานอธิการบดี", "name_en": "Office of the President",
					"type": "OFFICE", "is_active": true,
				},
			}

			for _, dept := range departments {
				if err := tx.Table("departments").Create(dept).Error; err != nil {
					return err
				}
			}

			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec("DELETE FROM departments").Error
		},
	}
}
