package middleware

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates JWT tokens and adds user info to context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		jwtSecret := os.Getenv("JWT_SECRET")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("invalid signing method")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// --- ✅ FIX STARTS HERE: More robust type checking ---

		// 1. Validate 'user_id' with flexible type handling
		var userIDUint uint
		userIDClaim, idExists := claims["user_id"]
		if !idExists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in token"})
			c.Abort()
			return
		}
		switch v := userIDClaim.(type) {
		case float64:
			userIDUint = uint(v)
		case int:
			userIDUint = uint(v)
		case int32:
			userIDUint = uint(v)
		case int64:
			userIDUint = uint(v)
		case uint:
			userIDUint = v
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id in token has an unexpected type"})
			c.Abort()
			return
		}

		// 2. Validate 'role'
		userRole, ok := claims["role"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "role not found or is not a string in token"})
			c.Abort()
			return
		}

		// 3. Validate 'email'
		email, ok := claims["email"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "email not found or is not a string in token"})
			c.Abort()
			return
		}

		// All claims are valid, set them in the context
		c.Set("userID", userIDUint)
		c.Set("userRole", userRole)
		c.Set("email", email)
		// --- ✅ FIX ENDS HERE ---

		c.Next()
	}
}

// AuthorizeRole checks if the authenticated user has the required role
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user role format in context"})
			c.Abort()
			return
		}

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
