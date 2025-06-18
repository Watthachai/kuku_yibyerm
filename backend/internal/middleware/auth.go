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
		log.Printf("🔍 Token received: %s...", tokenString[:50])

		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			log.Println("❌ JWT_SECRET not found in environment!")
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Server configuration error",
			})
			c.Abort()
			return
		}

		log.Printf("🔑 Using JWT Secret: %s... (length: %d)", jwtSecret[:10], len(jwtSecret))

		// ⭐ JWT v5 syntax
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Check signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("❌ Unexpected signing method: %v", token.Header["alg"])
				return nil, errors.New("invalid signing method") // ⭐ ใช้ errors.New แทน
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

		// ⭐ JWT v5 claims syntax
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

		// Set user info in context
		c.Set("user_id", claims["user_id"])
		c.Set("email", claims["email"])
		c.Set("role", claims["role"])

		log.Printf("✅ Token validated successfully for user: %v (role: %v)", claims["email"], claims["role"])
		c.Next()
	}
}

// AuthorizeRole checks if the authenticated user has the required role
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			log.Println("❌ User role not found in context")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "User role not found",
			})
			c.Abort()
			return
		}

		userRole, ok := role.(string)
		if !ok {
			log.Printf("❌ Invalid role type: %T", role)
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid role type",
			})
			c.Abort()
			return
		}

		if userRole != requiredRole && userRole != "ADMIN" { // Admin can access everything
			log.Printf("❌ Insufficient permissions. Required: %s, Got: %s", requiredRole, userRole)
			c.JSON(http.StatusForbidden, gin.H{
				"success":  false,
				"message":  "Insufficient permissions",
				"required": requiredRole,
				"current":  userRole,
			})
			c.Abort()
			return
		}

		log.Printf("✅ Role authorization passed: %s", userRole)
		c.Next()
	}
}
