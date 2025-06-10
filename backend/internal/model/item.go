package model

import "time"

type Item struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"not null"`
	Category     string    `json:"category"`
	SerialNumber string    `json:"serial_number" gorm:"unique"`
	Status       string    `json:"status" gorm:"default:'available'"`
	CreatedAt    time.Time `json:"created_at"`
}
