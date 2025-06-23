package models

import (
	"gorm.io/gorm"
)

type Category struct {
	gorm.Model // ID (uint), CreatedAt, UpdatedAt, DeletedAt

	Name        string `json:"name" gorm:"size:255;not null;unique"`
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
