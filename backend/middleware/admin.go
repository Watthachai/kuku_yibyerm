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
		log.Println("🔍 AdminMiddleware called")

		// ⭐ Debug: ตรวจสอบ URL path
		log.Printf("🔍 Request path: %s", c.Request.URL.Path)

		// ⭐ Debug: ตรวจสอบ context ทั้งหมด
		log.Println("🔍 Checking all context keys:")
		keys := c.Keys
		if len(keys) > 0 {
			for k, v := range keys {
				log.Printf("  - Context[%s]: %v (type: %T)", k, v, v)
			}
		} else {
			log.Println("  - Context is empty or nil!")
		}

		// ⭐ ลองอ่าน context แบบต่างๆ
		if userID, exists := c.Get("userID"); exists {
			log.Printf("✅ userID found: %v (type: %T)", userID, userID)
		} else {
			log.Println("❌ userID not found")
		}

		if email, exists := c.Get("email"); exists {
			log.Printf("✅ email found: %v (type: %T)", email, email)
		} else {
			log.Println("❌ email not found")
		}

		// Get user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("userRole")
		if !exists {
			log.Println("❌ User role not found in context")

			// ⭐ Debug เพิ่มเติม - ดูว่า AuthMiddleware ทำงานหรือไม่
			log.Println("🔍 Possible causes:")
			log.Println("  1. AuthMiddleware not called before AdminMiddleware")
			log.Println("  2. Context was cleared")
			log.Println("  3. Different gin.Context instance")

			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User role not found in context. AuthMiddleware may not have run first",
				"debug": map[string]interface{}{
					"path":        c.Request.URL.Path,
					"method":      c.Request.Method,
					"contextKeys": len(keys),
				},
			})
			c.Abort()
			return
		}

		log.Printf("✅ User role found in context: %v (type: %T)", userRole, userRole)

		// แก้ไขการตรวจสอบ role ให้รับได้ทั้ง string และ models.Role
		var roleStr string
		switch v := userRole.(type) {
		case string:
			roleStr = v
		case models.Role:
			roleStr = string(v)
		default:
			log.Printf("❌ Invalid user role format: %T, value: %v", userRole, userRole)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user role format",
				"debug": map[string]interface{}{
					"roleType":  fmt.Sprintf("%T", userRole),
					"roleValue": userRole,
				},
			})
			c.Abort()
			return
		}

		log.Printf("🔍 Role string: %s", roleStr)

		// Check if user has admin role
		if models.Role(roleStr) != models.RoleAdmin {
			log.Printf("❌ Access denied. Required: %s, Current: %s", models.RoleAdmin, roleStr)
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Access denied. Admin role required",
				"required": string(models.RoleAdmin),
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		log.Printf("✅ Admin access granted for role: %s", roleStr)
		c.Next()
	}
}
