package models

import (
	"gorm.io/gorm"
)

// ⭐ 1. สร้าง Type ใหม่สำหรับวิธีการติดตาม
type TrackingMethod string

const (
	TrackByItem     TrackingMethod = "BY_ITEM"     // ติดตามรายชิ้น (ครุภัณฑ์)
	TrackByQuantity TrackingMethod = "BY_QUANTITY" // ติดตามเป็นจำนวน (วัสดุสิ้นเปลือง)
)

// Product represents an item in the master catalog.
type Product struct {
	gorm.Model // ⭐️ ใช้ gorm.Model เพื่อสร้าง ID (uint) และ Timestamps อัตโนมัติ

	Name         string  `json:"name" gorm:"size:255;not null"`
	Description  string  `json:"description" gorm:"type:text"`
	ImageURL     string  `json:"image_url" gorm:"size:255"`
	Brand        *string `json:"brand" gorm:"size:100"`
	ProductModel *string `json:"product_model" gorm:"size:100"`
	// ⭐ 2. เพิ่ม Field ใหม่เข้ามาใน Struct
	TrackingMethod TrackingMethod `json:"tracking_method" gorm:"type:varchar(20);default:'BY_ITEM'"`
	// ⭐ แก้ไข Foreign Key ให้เป็น uint เพื่อให้ตรงกับ ID ของ Category
	CategoryID uint     `json:"category_id" gorm:"not null"`
	Category   Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`

	Assets []Asset `json:"assets,omitempty" gorm:"foreignKey:ProductID"`
}

// TableName specifies the table name for Product model
func (Product) TableName() string {
	return "products"
}
