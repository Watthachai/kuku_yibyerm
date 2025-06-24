package migrations

import (
	"ku-asset/models"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

var M25680624001SeedFacultiesAndDepartments = &gormigrate.Migration{
	ID: "25680624001_seed_faculties_and_departments",
	Migrate: func(tx *gorm.DB) error {
		// ตรวจสอบว่ามีข้อมูลคณะอยู่แล้วหรือไม่
		var count int64
		tx.Model(&models.Department{}).Where("type = ?", models.DepartmentTypeFaculty).Count(&count)
		if count > 0 {
			return nil // มีข้อมูลแล้ว ไม่ต้อง seed
		}

		// สร้างข้อมูลคณะ
		faculties := []models.Department{
			{
				Code:     "AGRI",
				NameTH:   "คณะเกษตร",
				NameEN:   "Faculty of Agriculture",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "ENG",
				NameTH:   "คณะวิศวกรรมศาสตร์",
				NameEN:   "Faculty of Engineering",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "SCI",
				NameTH:   "คณะวิทยาศาสตร์",
				NameEN:   "Faculty of Science",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "LIB",
				NameTH:   "คณะศิลปศาสตร์",
				NameEN:   "Faculty of Liberal Arts",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "ECON",
				NameTH:   "คณะเศรษฐศาสตร์",
				NameEN:   "Faculty of Economics",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "EDU",
				NameTH:   "คณะศึกษาศาสตร์",
				NameEN:   "Faculty of Education",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "SOC",
				NameTH:   "คณะสังคมศาสตร์",
				NameEN:   "Faculty of Social Sciences",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "VET",
				NameTH:   "คณะสัตวแพทยศาสตร์",
				NameEN:   "Faculty of Veterinary Medicine",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "FOREST",
				NameTH:   "คณะวนศาสตร์",
				NameEN:   "Faculty of Forestry",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "FISH",
				NameTH:   "คณะประมง",
				NameEN:   "Faculty of Fisheries",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
			{
				Code:     "ARCH",
				NameTH:   "คณะสถาปัตยกรรมศาสตร์",
				NameEN:   "Faculty of Architecture",
				Type:     models.DepartmentTypeFaculty,
				IsActive: true,
			},
		} // สร้างคณะ
		for _, faculty := range faculties {
			if err := tx.FirstOrCreate(&faculty, models.Department{Code: faculty.Code}).Error; err != nil {
				return err
			}
		}

		// สร้างภาควิชา/หน่วยงาน
		var agri, eng, sci, lib, econ models.Department

		// หาคณะที่สร้างแล้ว
		tx.Where("code = ?", "AGRI").First(&agri)
		tx.Where("code = ?", "ENG").First(&eng)
		tx.Where("code = ?", "SCI").First(&sci)
		tx.Where("code = ?", "LIB").First(&lib)
		tx.Where("code = ?", "ECON").First(&econ)

		departments := []models.Department{
			// คณะเกษตร
			{
				Code:     "AGRI-CROP",
				NameTH:   "ภาควิชาพืชไร่",
				NameEN:   "Department of Agronomy",
				Type:     models.DepartmentTypeDivision,
				ParentID: &agri.ID,
				IsActive: true,
			},
			{
				Code:     "AGRI-HORT",
				NameTH:   "ภาควิชาพืชสวน",
				NameEN:   "Department of Horticulture",
				Type:     models.DepartmentTypeDivision,
				ParentID: &agri.ID,
				IsActive: true,
			},
			{
				Code:     "AGRI-SOIL",
				NameTH:   "ภาควิชาปฐพีวิทยา",
				NameEN:   "Department of Soil Science",
				Type:     models.DepartmentTypeDivision,
				ParentID: &agri.ID,
				IsActive: true,
			},

			// คณะวิศวกรรมศาสตร์
			{
				Code:     "ENG-CIVIL",
				NameTH:   "ภาควิชาวิศวกรรมโยธา",
				NameEN:   "Department of Civil Engineering",
				Type:     models.DepartmentTypeDivision,
				ParentID: &eng.ID,
				IsActive: true,
			},
			{
				Code:     "ENG-MECH",
				NameTH:   "ภาควิชาวิศวกรรมเครื่องกล",
				NameEN:   "Department of Mechanical Engineering",
				Type:     models.DepartmentTypeDivision,
				ParentID: &eng.ID,
				IsActive: true,
			},
			{
				Code:     "ENG-ELEC",
				NameTH:   "ภาควิชาวิศวกรรมไฟฟ้า",
				NameEN:   "Department of Electrical Engineering",
				Type:     models.DepartmentTypeDivision,
				ParentID: &eng.ID,
				IsActive: true,
			},

			// คณะวิทยาศาสตร์
			{
				Code:     "SCI-MATH",
				NameTH:   "ภาควิชาคณิตศาสตร์",
				NameEN:   "Department of Mathematics",
				Type:     models.DepartmentTypeDivision,
				ParentID: &sci.ID,
				IsActive: true,
			},
			{
				Code:     "SCI-PHYSICS",
				NameTH:   "ภาควิชาฟิสิกส์",
				NameEN:   "Department of Physics",
				Type:     models.DepartmentTypeDivision,
				ParentID: &sci.ID,
				IsActive: true,
			},
			{
				Code:     "SCI-CHEM",
				NameTH:   "ภาควิชาเคมี",
				NameEN:   "Department of Chemistry",
				Type:     models.DepartmentTypeDivision,
				ParentID: &sci.ID,
				IsActive: true,
			},

			// คณะศิลปศาสตร์
			{
				Code:     "LIB-THAI",
				NameTH:   "ภาควิชาภาษาไทย",
				NameEN:   "Department of Thai",
				Type:     models.DepartmentTypeDivision,
				ParentID: &lib.ID,
				IsActive: true,
			},
			{
				Code:     "LIB-ENG",
				NameTH:   "ภาควิชาภาษาอังกฤษ",
				NameEN:   "Department of English",
				Type:     models.DepartmentTypeDivision,
				ParentID: &lib.ID,
				IsActive: true,
			},

			// คณะเศรษฐศาสตร์
			{
				Code:     "ECON-GEN",
				NameTH:   "ภาควิชาเศรษฐศาสตร์",
				NameEN:   "Department of Economics",
				Type:     models.DepartmentTypeDivision,
				ParentID: &econ.ID,
				IsActive: true,
			},
			{
				Code:     "ECON-COOP",
				NameTH:   "ภาควิชาสหกรณ์",
				NameEN:   "Department of Cooperatives",
				Type:     models.DepartmentTypeDivision,
				ParentID: &econ.ID,
				IsActive: true,
			},
		} // สร้างภาควิชา
		for _, dept := range departments {
			if err := tx.FirstOrCreate(&dept, models.Department{Code: dept.Code}).Error; err != nil {
				return err
			}
		}

		return nil
	},
	Rollback: func(tx *gorm.DB) error {
		// ลบข้อมูล departments และ faculties ที่สร้าง
		return tx.Where("type IN ?", []models.DepartmentType{
			models.DepartmentTypeFaculty,
			models.DepartmentTypeDivision,
		}).Delete(&models.Department{}).Error
	},
}
