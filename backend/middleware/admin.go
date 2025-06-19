package middleware

import (
	"net/http"

	"ku-asset/models"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware checks if the authenticated user has admin role
func AdminMiddleware() gin.HandlerFunc {
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

		// Check if user has admin role
		if models.Role(roleStr) != models.RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Access denied. Admin role required",
				"required": string(models.RoleAdmin),
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
