package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Code         string         `json:"code" gorm:"uniqueIndex;size:50"` // ⭐ เพิ่มรหัสสินค้า
	Name         string         `json:"name" gorm:"not null;size:255"`
	Description  string         `json:"description" gorm:"type:text"`
	CategoryID   uint           `json:"category_id"`
	Category     Category       `json:"category" gorm:"foreignKey:CategoryID"`
	Brand        string         `json:"brand" gorm:"size:100"`              // ⭐ แบรนด์
	ProductModel string         `json:"product_model" gorm:"size:100"`      // ⭐ รุ่นสินค้า
	Stock        int            `json:"stock" gorm:"default:0;not null"`    // ⭐ จำนวนคงเหลือ
	MinStock     int            `json:"min_stock" gorm:"default:0"`         // ⭐ จำนวนขั้นต่ำ (optional)
	Unit         string         `json:"unit" gorm:"size:20;default:'ชิ้น'"` // ⭐ หน่วยนับ
	Status       ProductStatus  `json:"status" gorm:"default:'ACTIVE'"`     // ⭐ สถานะสินค้า
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// ⭐ Product Status Enum
type ProductStatus string

const (
	ProductStatusActive     ProductStatus = "ACTIVE"       // ใช้งานได้
	ProductStatusInactive   ProductStatus = "INACTIVE"     // ไม่ใช้งาน
	ProductStatusOutOfStock ProductStatus = "OUT_OF_STOCK" // หมดสต็อก
)

func (Product) TableName() string {
	return "products"
}
