package middleware

import (
	"net/http"
	"strings"

	"kuku-yipyerm/internal/auth"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT tokens and adds user info to context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Check if the header starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format. Expected: Bearer <token>",
			})
			c.Abort()
			return
		}

		// Extract the token (remove "Bearer " prefix)
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token is required",
			})
			c.Abort()
			return
		}

		// Validate the token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid or expired token",
				"details": err.Error(),
			})
			c.Abort()
			return
		}

		// Check if it's an access token
		if claims.Type != "access" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token type. Access token required",
			})
			c.Abort()
			return
		}

		// Add user information to the context
		c.Set("userID", claims.UserID)
		c.Set("userRole", claims.Role)
		c.Set("claims", claims)

		// Continue to the next handler
		c.Next()
	}
}

// OptionalAuthMiddleware validates JWT tokens but doesn't require them
// Useful for endpoints that work differently for authenticated vs anonymous users
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// If no auth header, continue without authentication
		if authHeader == "" {
			c.Next()
			return
		}

		// If auth header exists, validate it
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")

			if claims, err := auth.ValidateToken(tokenString); err == nil && claims.Type == "access" {
				// Valid token - add user info to context
				c.Set("userID", claims.UserID)
				c.Set("userRole", claims.Role)
				c.Set("claims", claims)
				c.Set("authenticated", true)
			}
		}

		c.Next()
	}
}

// AuthorizeRole checks if the authenticated user has the required role
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User role not found in context. Make sure AuthMiddleware is used first",
			})
			c.Abort()
			return
		}

		// Convert to string and check role
		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user role format",
			})
			c.Abort()
			return
		}

		// Check if user has the required role
		if roleStr != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Insufficient permissions",
				"required": requiredRole,
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AuthorizeRoles checks if the authenticated user has any of the required roles
func AuthorizeRoles(requiredRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User role not found in context",
			})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user role format",
			})
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		for _, requiredRole := range requiredRoles {
			if roleStr == requiredRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error":    "Insufficient permissions",
			"required": requiredRoles,
			"current":  roleStr,
		})
		c.Abort()
	}
}
