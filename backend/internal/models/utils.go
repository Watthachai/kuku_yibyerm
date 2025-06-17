package models

import (
	"fmt"
	"math/rand"
	"time"
)

// generateID generates a unique ID with prefix
func generateID(prefix string) string {
	timestamp := time.Now().Unix()
	random := rand.Intn(10000)
	return fmt.Sprintf("%s%d%04d", prefix, timestamp, random)
}

// generateRequestNumber generates a unique request number
func generateRequestNumber() string {
	now := time.Now()
	year := now.Year()
	month := now.Month()
	day := now.Day()
	random := rand.Intn(10000)

	return fmt.Sprintf("REQ%04d%02d%02d%04d", year, month, day, random)
}
