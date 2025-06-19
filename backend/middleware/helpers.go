package middleware

import (
	"errors"

	"ku-asset/auth"
	"ku-asset/models"

	"github.com/gin-gonic/gin"
)

// GetUserID extracts user ID from gin context
func GetUserID(c *gin.Context) (uint, error) {
	userID, exists := c.Get("userID")
	if !exists {
		return 0, errors.New("user ID not found in context")
	}

	id, ok := userID.(uint)
	if !ok {
		return 0, errors.New("invalid user ID format")
	}

	return id, nil
}

// GetUserRole extracts user role from gin context
func GetUserRole(c *gin.Context) (models.Role, error) {
	userRole, exists := c.Get("userRole")
	if !exists {
		return "", errors.New("user role not found in context")
	}

	role, ok := userRole.(models.Role)
	if !ok {
		return "", errors.New("invalid user role format")
	}

	return role, nil
}

// GetClaims extracts JWT claims from gin context
func GetClaims(c *gin.Context) (*auth.Claims, error) {
	claims, exists := c.Get("claims")
	if !exists {
		return nil, errors.New("claims not found in context")
	}

	jwtClaims, ok := claims.(*auth.Claims)
	if !ok {
		return nil, errors.New("invalid claims format")
	}

	return jwtClaims, nil
}

// IsAuthenticated checks if the user is authenticated
func IsAuthenticated(c *gin.Context) bool {
	_, exists := c.Get("userID")
	return exists
}

// RequireAuth is a helper function that returns an error if user is not authenticated
func RequireAuth(c *gin.Context) (uint, error) {
	if !IsAuthenticated(c) {
		return 0, errors.New("authentication required")
	}

	return GetUserID(c)
}
