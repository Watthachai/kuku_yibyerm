package models

import (
	"time"

	"gorm.io/gorm"
)

// Department represents a university department/faculty
type Department struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Code        string         `json:"code" gorm:"uniqueIndex;size:20;not null"`
	NameTH      string         `json:"name_th" gorm:"size:255;not null"`
	NameEN      string         `json:"name_en" gorm:"size:255"`
	Type        DepartmentType `json:"type" gorm:"type:varchar(20);default:'FACULTY'"`
	ParentID    *uint          `json:"parent_id" gorm:"index"`
	Parent      *Department    `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children    []Department   `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	Description *string        `json:"description" gorm:"type:text"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relations
	Users []User `json:"users,omitempty" gorm:"foreignKey:DepartmentID"`
}

// DepartmentType enum for different types of departments
type DepartmentType string

const (
	DepartmentTypeFaculty   DepartmentType = "FACULTY"
	DepartmentTypeDivision  DepartmentType = "DIVISION"
	DepartmentTypeInstitute DepartmentType = "INSTITUTE"
	DepartmentTypeCenter    DepartmentType = "CENTER"
	DepartmentTypeOffice    DepartmentType = "OFFICE"
)

// TableName specifies the table name for Department model
func (Department) TableName() string {
	return "departments"
}

// BeforeCreate hook to set default values
func (d *Department) BeforeCreate(tx *gorm.DB) error {
	if d.Type == "" {
		d.Type = DepartmentTypeFaculty
	}
	return nil
}
