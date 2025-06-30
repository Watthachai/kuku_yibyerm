package middleware

import (
	"fmt"
	"log"
	"net/http"

	"ku-asset/models"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware checks if the authenticated user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AdminMiddleware ---")

		// Get user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("userRole")
		if !exists {
			log.Println("❌ User role not found in context")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			log.Println("❌ Invalid user role type")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user role type"})
			c.Abort()
			return
		}

		log.Printf("🔍 Checking role: %s", roleStr)

		// Check if user has admin role
		if roleStr != string(models.RoleAdmin) {
			userEmail, _ := c.Get("userEmail")
			log.Printf("❌ Access denied for user %v: role %s is not admin", userEmail, roleStr)
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("Access denied. Required role: %s, your role: %s", models.RoleAdmin, roleStr),
			})
			c.Abort()
			return
		}

		userEmail, _ := c.Get("userEmail")
		log.Printf("✅ Admin access granted for user: %v", userEmail)
		c.Next()
		log.Println("--- EXIT AdminMiddleware ---")
	}
}
