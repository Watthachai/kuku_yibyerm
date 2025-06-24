package auth

import (
	"errors"
	"os"
	"strconv"
	"time"

	"ku-asset/models"

	"github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT claims
type Claims struct {
	UserID uint        `json:"user_id"`
	Role   models.Role `json:"role"`
	Type   string      `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

var jwtSecret = []byte("your-secret-key") // ในการใช้งานจริงควรอ่านจาก ENV

// getTokenDuration returns token duration from env or default
func getTokenDuration(envKey string, defaultDuration time.Duration) time.Duration {
	if value := os.Getenv(envKey); value != "" {
		if hours, err := strconv.Atoi(value); err == nil {
			return time.Duration(hours) * time.Hour
		}
	}
	return defaultDuration
}

// GenerateAccessToken generates a new access token
func GenerateAccessToken(userID uint, role models.Role) (string, error) {
	// ⭐ อ่านค่าจาก ENV หรือใช้ default 24 ชั่วโมง
	duration := getTokenDuration("JWT_ACCESS_TOKEN_DURATION_HOURS", 24*time.Hour)

	claims := &Claims{
		UserID: userID,
		Role:   role,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   strconv.Itoa(int(userID)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken generates a new refresh token
func GenerateRefreshToken(userID uint) (string, error) {
	// ⭐ อ่านค่าจาก ENV หรือใช้ default 7 วัน
	duration := getTokenDuration("JWT_REFRESH_TOKEN_DURATION_HOURS", 7*24*time.Hour)

	claims := &Claims{
		UserID: userID,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   strconv.Itoa(int(userID)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates a JWT token and returns claims
func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshAccessToken generates a new access token using refresh token
func RefreshAccessToken(refreshTokenString string) (string, error) {
	claims, err := ValidateToken(refreshTokenString)
	if err != nil {
		return "", err
	}

	if claims.Type != "refresh" {
		return "", errors.New("invalid token type")
	}

	// Get user from database to get current role
	// For now, we'll use the role from refresh token
	// In production, you should fetch fresh user data

	return GenerateAccessToken(claims.UserID, claims.Role)
}
