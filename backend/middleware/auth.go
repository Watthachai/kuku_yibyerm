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
		log.Println("--- ENTER AuthMiddleware ---")

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Println("--- EXIT AuthMiddleware (FAIL: No Auth Header) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Println("--- EXIT AuthMiddleware (FAIL: Invalid Auth Header Format) ---")
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
			log.Println("--- EXIT AuthMiddleware (FAIL: Invalid Token) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			log.Println("--- EXIT AuthMiddleware (FAIL: Invalid Claims) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// 1. Validate 'user_id' with flexible type handling
		var userIDUint uint
		userIDClaim, idExists := claims["user_id"]
		if !idExists {
			log.Println("--- EXIT AuthMiddleware (FAIL: user_id not in token) ---")
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
			log.Println("--- EXIT AuthMiddleware (FAIL: user_id has bad type) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id in token has an unexpected type"})
			c.Abort()
			return
		}

		// 2. Validate 'role'
		userRole, ok := claims["role"].(string)
		if !ok {
			log.Println("--- EXIT AuthMiddleware (FAIL: role not in token or not string) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "role not found or is not a string in token"})
			c.Abort()
			return
		}

		// 3. Validate 'email'
		email, ok := claims["email"].(string)
		if !ok {
			log.Println("--- EXIT AuthMiddleware (FAIL: email not in token or not string) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "email not found or is not a string in token"})
			c.Abort()
			return
		}

		// All claims are valid, set them in the context
		c.Set("userID", userIDUint)
		c.Set("userRole", userRole)
		c.Set("email", email)

		log.Println("--- EXIT AuthMiddleware (SUCCESS) ---")
		c.Next()
	}
}

// AuthorizeRole checks if the authenticated user has the required role
func AuthorizeRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AuthorizeRole ---")

		userRole, exists := c.Get("userRole")
		if !exists {
			log.Println("--- EXIT AuthorizeRole (FAIL: Role not in context) ---")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User role not found in context"})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			log.Println("--- EXIT AuthorizeRole (FAIL: Role has bad type) ---")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user role format in context"})
			c.Abort()
			return
		}

		if roleStr != requiredRole {
			log.Println("--- EXIT AuthorizeRole (FAIL: Insufficient permissions) ---")
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "Insufficient permissions",
				"required": requiredRole,
				"current":  roleStr,
			})
			c.Abort()
			return
		}

		log.Println("--- EXIT AuthorizeRole (SUCCESS) ---")
		c.Next()
	}
}
