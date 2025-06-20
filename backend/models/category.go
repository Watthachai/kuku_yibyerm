package models

import (
	"gorm.io/gorm"
)

type Category struct {
	gorm.Model // ⭐️ ใช้ gorm.Model เพื่อสร้าง ID (uint), CreatedAt, UpdatedAt, DeletedAt อัตโนมัติ

	Name        string `json:"name" gorm:"size:255;not null;unique"` // เพิ่ม unique เพื่อไม่ให้ชื่อซ้ำ
	Description string `json:"description" gorm:"type:text"`
	Icon        string `json:"icon" gorm:"size:10"`
	Color       string `json:"color" gorm:"size:50"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`

	// Relationships
	Products []Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

// TableName specifies the table name for Category model
func (Category) TableName() string {
	return "categories"
}
