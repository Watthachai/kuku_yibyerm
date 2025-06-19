// models/product.go
package models

import (
	"time"

	"gorm.io/gorm"
)

// Product represents an item in the master catalog.
// It does not contain stock information.
type Product struct {
	ID          string `json:"id" gorm:"primaryKey;type:varchar(50)"`
	Name        string `json:"name" gorm:"size:255;not null"`
	Description string `json:"description" gorm:"type:text"`
	ImageURL    string `json:"image_url" gorm:"size:255"`

	CategoryID string   `json:"category_id" gorm:"type:varchar(50);not null"`
	Category   Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`

	// A Product can have many assets.
	Assets []Asset `json:"assets,omitempty" gorm:"foreignKey:ProductID"`

	// gorm.Model is not used here because you have a custom string ID
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// You might need a function to check if a product is available based on its assets.
func (p *Product) IsAvailableForBorrow(quantity int) bool {
	// This logic should now likely live in the Asset service
	// For now, we assume it's possible.
	return true
}
