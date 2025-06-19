package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID          string         `json:"id" gorm:"primaryKey;type:varchar(50)"`
	Name        string         `json:"name" gorm:"size:255;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Icon        string         `json:"icon" gorm:"size:10"`
	Color       string         `json:"color" gorm:"size:50"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	Products []Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

// TableName specifies the table name for Category model
func (Category) TableName() string {
	return "categories"
}
