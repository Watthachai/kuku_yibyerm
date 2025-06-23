package middleware

import (
	"errors"
	"ku-asset/models"
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
		log.Printf("🔍 Auth middleware called for: %s %s", c.Request.Method, c.Request.URL.Path)

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Println("❌ No Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header is required",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("❌ Invalid auth header format: %s", authHeader)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header format. Expected: Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]
		log.Printf("🔍 Token received: %s...", tokenString[:30])

		jwtSecret := os.Getenv("JWT_SECRET")
		log.Printf("🔑 Using JWT Secret: %s... (length: %d)", jwtSecret[:10], len(jwtSecret))

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("invalid signing method")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil {
			log.Printf("❌ JWT Parse Error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
				"details": err.Error(),
			})
			c.Abort()
			return
		}

		if !token.Valid {
			log.Println("❌ Token is not valid")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token is not valid",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Println("❌ Invalid token claims")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// ⭐ แก้ไขการ Set Context ให้ตรงกับที่ helpers.go คาดหวัง
		userID, exists := claims["user_id"]
		if !exists {
			log.Println("❌ user_id not found in token claims")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "user_id not found in token",
			})
			c.Abort()
			return
		}

		// แปลง user_id เป็น uint
		var userIDUint uint
		switch v := userID.(type) {
		case float64:
			userIDUint = uint(v)
		case int:
			userIDUint = uint(v)
		case uint:
			userIDUint = v
		default:
			log.Printf("❌ Invalid user_id type: %T, value: %v", userID, userID)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid user_id format in token",
			})
			c.Abort()
			return
		}

		// Set context for later use
		// ⭐ Set context keys ให้ตรงกับที่ helpers.go ต้องการ
		c.Set("userID", userIDUint)
		c.Set("userRole", claims["role"])
		c.Set("email", claims["email"])

		log.Printf("✅ Token validated successfully for user: %v (role: %v), userID set: %v",
			claims["email"], claims["role"], userIDUint)

		// ⭐ เพิ่ม debug - ทดสอบอ่าน context ทันที
		testRole, exists := c.Get("userRole")
		if exists {
			log.Printf("🔍 Context TEST: userRole = %v (type: %T)", testRole, testRole)
		} else {
			log.Printf("❌ Context TEST: userRole not found immediately after setting!")
		}

		c.Next()
	}
}

// AuthorizeRole checks if the authenticated user has the required role
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("🔍 AuthorizeRole called for: %s", requiredRole)

		// ⭐ Debug: ตรวจสอบ context ทั้งหมด
		log.Println("🔍 Current context keys:")
		if c.Keys != nil {
			for k, v := range c.Keys {
				log.Printf("  - %s: %v (type: %T)", k, v, v)
			}
		}

		// Get user role from context (set by AuthMiddleware)
		userRole, exists := c.Get("userRole")
		if !exists {
			log.Println("❌ User role not found in AuthorizeRole")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User role not found in context. Make sure AuthMiddleware is used first",
			})
			c.Abort()
			return
		}

		log.Printf("✅ Found userRole in AuthorizeRole: %v (type: %T)", userRole, userRole)

		// Convert to string and check role
		roleStr, ok := userRole.(string)
		if !ok {
			log.Printf("❌ Invalid role type: %T, value: %v", userRole, userRole)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user role format",
			})
			c.Abort()
			return
		}

		// Check if user has the required role
		if roleStr != requiredRole {
			log.Printf("❌ Role mismatch: required=%s, current=%s", requiredRole, roleStr)
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Insufficient permissions",
				"required": requiredRole,
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		log.Printf("✅ Role check passed: %s", roleStr)
		c.Next()
	}
}

// AuthAdminMiddleware combines authentication and admin role check
func AuthAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("🔍 AuthAdminMiddleware called")

		// ทำ auth check ก่อน (copy จาก AuthMiddleware)
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Println("❌ No authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			log.Println("❌ Invalid authorization header format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := bearerToken[1]
		log.Printf("🔍 Token received: %s...", tokenString[:min(len(tokenString), 20)])

		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			log.Println("❌ JWT_SECRET not set")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			c.Abort()
			return
		}

		log.Printf("🔑 Using JWT Secret: %s... (length: %d)", jwtSecret[:min(len(jwtSecret), 10)], len(jwtSecret))

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("❌ Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// ตรวจสอบ role ทันที
		roleInterface, ok := claims["role"]
		if !ok {
			log.Println("❌ Role not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Role not found in token"})
			c.Abort()
			return
		}

		roleStr, ok := roleInterface.(string)
		if !ok {
			log.Printf("❌ Role is not string: %T", roleInterface)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid role format"})
			c.Abort()
			return
		}

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

		// Set context
		userIDFloat, _ := claims["user_id"].(float64)
		userIDUint := uint(userIDFloat)

		c.Set("userID", userIDUint)
		c.Set("userRole", roleStr)
		c.Set("email", claims["email"])

		log.Printf("✅ Admin authenticated: %v (role: %v), userID: %v", claims["email"], roleStr, userIDUint)
		c.Next()
	}
}
