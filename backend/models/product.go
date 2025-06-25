package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	gorm.Model // ID, CreatedAt, UpdatedAt, DeletedAt

	// ⭐ เพิ่ม ImageURL field
	ImageURL *string `json:"image_url" gorm:"type:varchar(255)"` // URL ของรูปภาพ

	// ข้อมูลพื้นฐาน
	Code         string   `json:"code" gorm:"unique;not null"`
	Name         string   `json:"name" gorm:"not null"`
	Description  string   `json:"description"`
	CategoryID   uint     `json:"category_id" gorm:"not null"`
	Category     Category `json:"category" gorm:"foreignKey:CategoryID"`
	Brand        string   `json:"brand"`
	ProductModel string   `json:"product_model"`

	// จำนวนและสต็อก
	Stock    int           `json:"stock" gorm:"default:0"`
	MinStock int           `json:"min_stock" gorm:"default:0"`
	Unit     string        `json:"unit" gorm:"size:20;default:'ชิ้น'"`
	Status   ProductStatus `json:"status" gorm:"default:'ACTIVE'"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// Product Status Enum
type ProductStatus string

const (
	ProductStatusActive       ProductStatus = "ACTIVE"
	ProductStatusInactive     ProductStatus = "INACTIVE"
	ProductStatusOutOfStock   ProductStatus = "OUT_OF_STOCK"
	ProductStatusDiscontinued ProductStatus = "DISCONTINUED"
)
