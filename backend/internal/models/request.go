package models

import (
	"time"

	"gorm.io/gorm"
)

type RequestStatus string
type RequestPriority string

const (
	RequestStatusPending   RequestStatus = "PENDING"   // รออนุมัติ
	RequestStatusApproved  RequestStatus = "APPROVED"  // อนุมัติแล้ว
	RequestStatusRejected  RequestStatus = "REJECTED"  // ปฏิเสธ
	RequestStatusIssued    RequestStatus = "ISSUED"    // เบิกแล้ว
	RequestStatusCompleted RequestStatus = "COMPLETED" // เสร็จสิ้น
)

const (
	RequestPriorityLow    RequestPriority = "LOW"
	RequestPriorityNormal RequestPriority = "NORMAL"
	RequestPriorityHigh   RequestPriority = "HIGH"
	RequestPriorityUrgent RequestPriority = "URGENT"
)

type Request struct {
	ID              string          `json:"id" gorm:"primaryKey;type:varchar(50)"`
	RequestNumber   string          `json:"request_number" gorm:"uniqueIndex;size:50;not null"`
	Purpose         string          `json:"purpose" gorm:"type:text;not null"`
	Notes           string          `json:"notes" gorm:"type:text"`
	Status          RequestStatus   `json:"status" gorm:"type:request_status;default:'PENDING'"`    // เปลี่ยนจาก enum
	Priority        RequestPriority `json:"priority" gorm:"type:request_priority;default:'NORMAL'"` // เปลี่ยนจาก enum
	RequestDate     time.Time       `json:"request_date" gorm:"not null"`
	RequiredDate    time.Time       `json:"required_date" gorm:"not null"`
	ApprovedDate    *time.Time      `json:"approved_date"`
	IssuedDate      *time.Time      `json:"issued_date"`
	CompletedDate   *time.Time      `json:"completed_date"`
	AdminNote       string          `json:"admin_note" gorm:"type:text"`
	RejectionReason string          `json:"rejection_reason" gorm:"type:text"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `json:"deleted_at" gorm:"index"`

	// Foreign Keys
	UserID       string  `json:"user_id" gorm:"type:varchar(50);not null"`
	ApprovedByID *string `json:"approved_by_id" gorm:"type:varchar(50)"`
	IssuedByID   *string `json:"issued_by_id" gorm:"type:varchar(50)"` // เจ้าหน้าที่ที่จ่ายของ

	// Relationships
	User       User          `json:"user" gorm:"foreignKey:UserID"`
	ApprovedBy *User         `json:"approved_by,omitempty" gorm:"foreignKey:ApprovedByID"`
	IssuedBy   *User         `json:"issued_by,omitempty" gorm:"foreignKey:IssuedByID"`
	Items      []RequestItem `json:"items" gorm:"foreignKey:RequestID"`
}

type RequestItem struct {
	ID        string         `json:"id" gorm:"primaryKey;type:varchar(50)"`
	Quantity  int            `json:"quantity" gorm:"not null"`
	Purpose   string         `json:"purpose" gorm:"type:text"`
	Notes     string         `json:"notes" gorm:"type:text"`
	Status    RequestStatus  `json:"status" gorm:"type:request_status;default:'PENDING'"` // เปลี่ยนจาก enum
	IssuedQty int            `json:"issued_qty" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Foreign Keys
	RequestID string `json:"request_id" gorm:"type:varchar(50);not null"`
	ProductID string `json:"product_id" gorm:"type:varchar(50);not null"`

	// Relationships
	Request Request `json:"request" gorm:"foreignKey:RequestID"`
	Product Product `json:"product" gorm:"foreignKey:ProductID"`
}

// TableName specifies the table name for Request model
func (Request) TableName() string {
	return "requests"
}

// TableName specifies the table name for RequestItem model
func (RequestItem) TableName() string {
	return "request_items"
}

// BeforeCreate hook to generate ID and request number
func (r *Request) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = generateID("REQ")
	}
	if r.RequestNumber == "" {
		r.RequestNumber = generateRequestNumber()
	}
	return nil
}

// BeforeCreate hook to generate ID
func (ri *RequestItem) BeforeCreate(tx *gorm.DB) error {
	if ri.ID == "" {
		ri.ID = generateID("RIT")
	}
	return nil
}

// CanBeApproved checks if request can be approved
func (r *Request) CanBeApproved() bool {
	return r.Status == RequestStatusPending
}

// CanBeIssued checks if request can be issued
func (r *Request) CanBeIssued() bool {
	return r.Status == RequestStatusApproved
}

// CanBeCompleted checks if request can be completed
func (r *Request) CanBeCompleted() bool {
	return r.Status == RequestStatusIssued
}
