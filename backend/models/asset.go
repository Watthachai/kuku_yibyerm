// models/asset.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Asset struct {
	gorm.Model // ID, CreatedAt, UpdatedAt, DeletedAt (เป็น uint)

	// Foreign key to link with the Product catalog
	ProductID uint `gorm:"not null"`
	Product   Product

	// --- ข้อมูลเฉพาะของ Asset ชิ้นนี้ ---
	AssetCode        string  `gorm:"unique;not null"`
	SerialNumber     *string `gorm:"unique"`
	Status           string  `gorm:"not null"`
	LocationBuilding string
	LocationRoom     string
	PurchaseDate     *time.Time
	WarrantyEndDate  *time.Time
	Quantity         int `gorm:"default:1"`

	ImageURL *string `gorm:"type:varchar(255)"` // 👈 เพิ่มบรรทัดนี้เข้ามา

	DepartmentID *uint
	Department   Department
}
