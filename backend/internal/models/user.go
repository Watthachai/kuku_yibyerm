package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Role string

const (
	AdminRole Role = "ADMIN"
	UserRole  Role = "USER"
	StaffRole Role = "STAFF"
)

// User defines the user model
type User struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Email      string         `json:"email" gorm:"uniqueIndex;not null"`
	Name       string         `json:"name" gorm:"not null"`
	Password   *string        `json:"-" gorm:"type:varchar(255)"` // Nullable for OAuth users
	Avatar     *string        `json:"avatar" gorm:"type:text"`
	Role       Role           `json:"role" gorm:"type:varchar(20);default:'USER'"`
	Provider   string         `json:"provider" gorm:"type:varchar(50);default:'local'"` // 'local', 'google', etc.
	ProviderID *string        `json:"providerId" gorm:"type:varchar(255)"`              // OAuth provider user ID
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for the User model
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to set default values
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = UserRole
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
