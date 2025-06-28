package middleware

import (
	"ku-asset/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware checks if the authenticated user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AdminMiddleware ---")

		userRole, exists := c.Get("userRole")
		if !exists {
			log.Println("--- EXIT AdminMiddleware (FAIL: Role not in context) ---")
			log.Println("Error in AdminMiddleware: userRole not found in context. AuthMiddleware might not have run first.")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			log.Printf("--- EXIT AdminMiddleware (FAIL: Role has bad type) ---")
			log.Printf("Error in AdminMiddleware: userRole in context is not a string (type: %T)", userRole)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user role format"})
			c.Abort()
			return
		}

		if models.Role(roleStr) != models.RoleAdmin {
			log.Println("--- EXIT AdminMiddleware (FAIL: Insufficient permissions) ---")
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Access denied. Admin role required",
				"required": string(models.RoleAdmin),
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		log.Println("--- EXIT AdminMiddleware (SUCCESS) ---")
		c.Next()
	}
}
