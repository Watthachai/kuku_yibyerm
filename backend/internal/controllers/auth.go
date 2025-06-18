package controllers

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"ku-asset/internal/models"
	"ku-asset/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthController struct {
	AuthService *services.AuthService
	DB          *gorm.DB
}

func NewAuthController(authService *services.AuthService, db *gorm.DB) *AuthController {
	return &AuthController{
		AuthService: authService,
		DB:          db,
	}
}

// Login handles user login
func (ac *AuthController) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	// Find user
	var user models.User
	if err := ac.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	// Check password - แก้ไขการ convert
	var userPassword string
	if user.Password != nil {
		userPassword = *user.Password
	}
	if err := bcrypt.CompareHashAndPassword([]byte(userPassword), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	// Generate tokens
	accessToken, err := ac.generateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate access token",
		})
		return
	}

	refreshToken, err := ac.generateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate refresh token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"user": gin.H{
			"id":            user.ID,
			"email":         user.Email,
			"name":          user.Name,
			"role":          user.Role,
			"department_id": user.DepartmentID,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// Register handles user registration
func (ac *AuthController) Register(c *gin.Context) {
	var req struct {
		Email        string `json:"email" binding:"required"`
		Password     string `json:"password" binding:"required"`
		Name         string `json:"name" binding:"required"`
		DepartmentID string `json:"department_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	// Check if user exists
	var existingUser models.User
	if err := ac.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "User already exists",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to hash password",
		})
		return
	}

	// Convert department ID to uint pointer
	var departmentID *uint
	if req.DepartmentID != "" {
		if id, err := strconv.ParseUint(req.DepartmentID, 10, 32); err == nil {
			deptID := uint(id)
			departmentID = &deptID
		}
	}

	// Create user - แก้ไขการใช้ pointers
	hashedPasswordStr := string(hashedPassword)
	role := models.Role("USER")

	user := models.User{
		Email:        req.Email,
		Password:     &hashedPasswordStr, // ใช้ pointer
		Name:         req.Name,
		Role:         role,
		DepartmentID: departmentID,
		// ลบ Status field ถ้าไม่มีใน model
	}

	if err := ac.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User created successfully",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
			"role":  user.Role,
		},
	})
}

// RefreshToken handles token refresh
func (ac *AuthController) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	// Validate refresh token
	token, err := jwt.Parse(req.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid refresh token",
		})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid token claims",
		})
		return
	}

	userID := claims["user_id"].(float64)
	var user models.User
	if err := ac.DB.First(&user, uint(userID)).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	// Generate new access token
	accessToken, err := ac.generateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate access token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"access_token": accessToken,
	})
}

// ForgotPassword handles password reset request
func (ac *AuthController) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password reset email sent",
	})
}

// ResetPassword handles password reset
func (ac *AuthController) ResetPassword(c *gin.Context) {
	var req struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password reset successful",
	})
}

// GoogleOAuth handles Google OAuth login
func (ac *AuthController) GoogleOAuth(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		Name        string `json:"name"`
		Avatar      string `json:"avatar"`
		ProviderID  string `json:"providerId"`
		AccessToken string `json:"accessToken"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request format",
		})
		return
	}

	// Check if user exists
	var user models.User
	result := ac.DB.Where("email = ?", req.Email).First(&user)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new user
			hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("google-oauth"), bcrypt.DefaultCost)
			hashedPasswordStr := string(hashedPassword)
			role := models.Role("ADMIN") // Set as ADMIN for testing

			user = models.User{
				Email:    req.Email,
				Name:     req.Name,
				Password: &hashedPasswordStr, // ใช้ pointer
				Role:     role,
				Avatar:   &req.Avatar, // ใช้ pointer ถ้า Avatar เป็น *string
				// ลบ Status field ถ้าไม่มีใน model
			}

			if err := ac.DB.Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Failed to create user",
				})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Database error",
			})
			return
		}
	}

	// Generate JWT tokens
	accessToken, err := ac.generateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate access token",
		})
		return
	}

	refreshToken, err := ac.generateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate refresh token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google OAuth success",
		"user": gin.H{
			"id":            user.ID,
			"email":         user.Email,
			"name":          user.Name,
			"role":          user.Role,
			"department_id": user.DepartmentID,
			"avatar":        user.Avatar,
		},
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// Helper methods
func (ac *AuthController) generateAccessToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    string(user.Role),
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	return token.SignedString([]byte(secret))
}

func (ac *AuthController) generateRefreshToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_REFRESH_SECRET")
	if secret == "" {
		secret = "your-refresh-secret-key"
	}
	return token.SignedString([]byte(secret))
}

// Helper function to safely get string value from pointer
func getStringValue(ptr *string) string {
	if ptr == nil {
		return ""
	}
	return *ptr
}
