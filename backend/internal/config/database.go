package config

import "fmt"

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	TimeZone string
	LogLevel string // เพิ่มฟิลด์นี้
}

// GetDSN returns database connection string
func (d DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
		d.Host, d.User, d.Password, d.Name, d.Port, d.SSLMode,
	)
}

// Validate checks if database configuration is valid
func (d DatabaseConfig) Validate() error {
	if d.Host == "" {
		return fmt.Errorf("database host is required")
	}
	if d.User == "" {
		return fmt.Errorf("database user is required")
	}
	if d.Name == "" {
		return fmt.Errorf("database name is required")
	}
	return nil
}
