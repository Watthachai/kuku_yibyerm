package models

import (
	"time"

	"gorm.io/gorm"
)

type ProductStatus string

const (
	ProductStatusAvailable   ProductStatus = "AVAILABLE"
	ProductStatusInUse       ProductStatus = "IN_USE"
	ProductStatusMaintenance ProductStatus = "MAINTENANCE"
	ProductStatusDamaged     ProductStatus = "DAMAGED"
)

type Product struct {
	ID                string         `json:"id" gorm:"primaryKey;type:varchar(50)"`
	Code              string         `json:"code" gorm:"uniqueIndex;size:100;not null"`
	Name              string         `json:"name" gorm:"size:255;not null"`
	Description       string         `json:"description" gorm:"type:text"`
	ImageURL          string         `json:"image_url" gorm:"size:500"`
	Status            ProductStatus  `json:"status" gorm:"type:product_status;default:'AVAILABLE'"` // Changed from enum
	TotalQuantity     int            `json:"total_quantity" gorm:"not null;default:1"`
	AvailableQuantity int            `json:"available_quantity" gorm:"not null;default:1"`
	Location          string         `json:"location" gorm:"size:255"`
	Price             float64        `json:"price" gorm:"type:decimal(10,2)"`
	PurchaseDate      *time.Time     `json:"purchase_date"`
	WarrantyEnd       *time.Time     `json:"warranty_end"`
	Rating            float64        `json:"rating" gorm:"type:decimal(3,2);default:0"`
	BorrowCount       int            `json:"borrow_count" gorm:"default:0"`
	IsActive          bool           `json:"is_active" gorm:"default:true"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Foreign Keys
	CategoryID   string `json:"category_id" gorm:"type:varchar(50);not null"`
	DepartmentID string `json:"department_id" gorm:"type:varchar(50);not null"`

	// Relationships
	Category   Category   `json:"category" gorm:"foreignKey:CategoryID"`
	Department Department `json:"department" gorm:"foreignKey:DepartmentID"`
}

// TableName specifies the table name for Product model
func (Product) TableName() string {
	return "products"
}

// BeforeCreate hook to generate ID
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = generateID("PRD")
	}
	return nil
}

// Update available quantity
func (p *Product) UpdateAvailableQuantity(borrowed int) {
	p.AvailableQuantity = p.TotalQuantity - borrowed
}

// Check if product is available for borrowing
func (p *Product) IsAvailableForBorrow(quantity int) bool {
	return p.Status == ProductStatusAvailable && p.AvailableQuantity >= quantity
}
