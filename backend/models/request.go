// models/request.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type RequestStatus string

const (
	RequestStatusPending   RequestStatus = "PENDING"
	RequestStatusApproved  RequestStatus = "APPROVED"
	RequestStatusRejected  RequestStatus = "REJECTED"
	RequestStatusIssued    RequestStatus = "ISSUED"
	RequestStatusCompleted RequestStatus = "COMPLETED"
)

type Request struct {
	gorm.Model // ID (uint), CreatedAt, UpdatedAt, DeletedAt

	RequestNumber string        `gorm:"uniqueIndex;size:50"`
	Purpose       string        `gorm:"type:text;not null"`
	Notes         string        `gorm:"type:text"`
	Status        RequestStatus `gorm:"type:varchar(20);default:'PENDING'"`
	AdminNote     string        `gorm:"type:text"`

	// ⭐️ เพิ่ม Field ที่ขาดไป
	RequestDate   time.Time `gorm:"not null"`
	ApprovedDate  *time.Time
	IssuedDate    *time.Time
	CompletedDate *time.Time

	// Foreign Keys
	UserID       uint
	ApprovedByID *uint
	IssuedByID   *uint

	// Relationships
	User       User
	ApprovedBy *User `gorm:"foreignKey:ApprovedByID"`
	IssuedBy   *User `gorm:"foreignKey:IssuedByID"`
	Items      []RequestItem
}

type RequestItem struct {
	gorm.Model // ID (uint)

	Quantity int `gorm:"not null"`

	// Foreign Keys
	RequestID uint
	ProductID uint

	// Relationships
	Product Product
}

// TableName specifies the table name for Request model
func (Request) TableName() string {
	return "requests"
}

// TableName specifies the table name for RequestItem model
func (RequestItem) TableName() string {
	return "request_items"
}

// BeforeCreate hook to generate request number (ID is handled by GORM)
func (r *Request) BeforeCreate(tx *gorm.DB) error {
	// r.RequestNumber = generateRequestNumber() // You can implement this helper if needed
	return nil
}
