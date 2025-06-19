package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Email        string         `json:"email" gorm:"uniqueIndex;not null"`
	Name         string         `json:"name" gorm:"not null"`
	Password     *string        `json:"-" gorm:"type:varchar(255)"` // Nullable for OAuth
	Avatar       *string        `json:"avatar" gorm:"type:text"`
	Role         Role           `json:"role" gorm:"type:varchar(20);default:'USER'"`
	Provider     string         `json:"provider" gorm:"type:varchar(50);default:'local'"`
	ProviderID   *string        `json:"provider_id" gorm:"type:varchar(255)"`
	DepartmentID *uint          `json:"department_id" gorm:"index"`
	Department   *Department    `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Phone        *string        `json:"phone" gorm:"type:varchar(20)"`
	IsActive     bool           `json:"is_active" gorm:"default:true"`
	LastLoginAt  *time.Time     `json:"last_login_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

// Role enum for user roles
type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to set default values
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = RoleUser
	}
	if u.Provider == "" {
		u.Provider = "local"
	}
	return nil
}

// CheckPassword compares a password with the hash stored in the database
func (u *User) CheckPassword(password string) error {
	if u.Password == nil {
		return bcrypt.ErrMismatchedHashAndPassword
	}
	return bcrypt.CompareHashAndPassword([]byte(*u.Password), []byte(password))
}

// SetPassword hashes and sets the password
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	hashedPasswordStr := string(hashedPassword)
	u.Password = &hashedPasswordStr
	return nil
}

// IsOAuthUser checks if the user signed up via OAuth
func (u *User) IsOAuthUser() bool {
	return u.Provider != "local"
}

// HasPassword checks if the user has a password set
func (u *User) HasPassword() bool {
	return u.Password != nil && *u.Password != ""
}
