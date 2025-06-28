package middleware

import (
	"fmt"
	"ku-asset/models"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// AuthMiddleware validates JWT token and sets user context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AuthMiddleware (REAL VERSION) ---")

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Println("❌ No Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Println("❌ Invalid Authorization format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		log.Printf("🔑 Validating token: %s...", tokenString[:min(len(tokenString), 20)])

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			// Use JWT secret from environment
			jwtSecret := getEnv("JWT_SECRET", "default-secret-key")
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("❌ Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Println("❌ Invalid token claims")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Get user ID from claims
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			log.Println("❌ Invalid user_id in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id in token"})
			c.Abort()
			return
		}

		userID := uint(userIDFloat)
		log.Printf("✅ Token valid for user ID: %d", userID)

		// Get database instance (you'll need to pass this somehow)
		db, exists := c.Get("db")
		if !exists {
			log.Println("❌ Database not available in context")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			c.Abort()
			return
		}

		// Fetch user from database
		var user models.User
		if err := db.(*gorm.DB).First(&user, userID).Error; err != nil {
			log.Printf("❌ User not found: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Set user context
		c.Set("userID", user.ID)
		c.Set("userRole", string(user.Role))
		c.Set("userEmail", user.Email)
		c.Set("user", user)

		log.Printf("✅ User authenticated: %s (%s)", user.Email, user.Role)
		c.Next()
		log.Println("--- EXIT AuthMiddleware ---")
	}
}

// Helper function to get environment variable
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// AuthorizeRole is kept here but might not function correctly in this test
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AuthorizeRole (This will likely fail) ---")
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}
		roleStr, _ := userRole.(string)
		if roleStr != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}
