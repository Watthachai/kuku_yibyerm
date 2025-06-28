package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware (DEBUG VERSION) - Bypasses token validation
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AuthMiddleware (DEBUG - Bypassing Validation) ---")

		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			log.Println("Authorization header is present. Passing through...")
		} else {
			log.Println("Authorization header is NOT present. Passing through anyway...")
		}

		// In this debug version, we do not validate the token.
		// We just pass the request to the next middleware.
		// This will likely cause errors in AdminMiddleware, but that's expected.
		// We just want to see if we get past this point.
		c.Next()
		log.Println("--- EXIT AuthMiddleware (DEBUG) ---")
	}
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
