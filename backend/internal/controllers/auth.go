// backend/internal/controllers/auth.go
package controllers

import (
	"net/http"
	"time"

	"ku-asset/internal/auth"
	"ku-asset/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthController handles authentication-related operations
type AuthController struct {
	DB *gorm.DB
}

// AuthResponse defines the structure for authentication response
type AuthResponse struct {
	AccessToken  string      `json:"accessToken"`
	RefreshToken string      `json:"refreshToken"`
	User         models.User `json:"user"`
}

// NewAuthController creates a new AuthController instance
func NewAuthController(db *gorm.DB) *AuthController {
	return &AuthController{DB: db}
}

// GoogleOAuthInput defines the structure for Google OAuth request
type GoogleOAuthInput struct {
	Email      string `json:"email" binding:"required,email"`
	Name       string `json:"name" binding:"required"`
	Avatar     string `json:"avatar"`
	ProviderID string `json:"provider_id" binding:"required"`
}

// GoogleOAuth handles Google OAuth authentication
// POST /api/v1/auth/oauth/google
func (ac *AuthController) GoogleOAuth(c *gin.Context) {
	var input GoogleOAuthInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	var user models.User

	// Check if user already exists
	err := ac.DB.Where("email = ?", input.Email).First(&user).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"details": err.Error(),
		})
		return
	}

	// User doesn't exist, create new one
	if err == gorm.ErrRecordNotFound {
		user = models.User{
			Name:       input.Name,
			Email:      input.Email,
			Avatar:     &input.Avatar,
			Role:       models.RoleUser, // Default role
			Provider:   "google",
			ProviderID: &input.ProviderID,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		if err := ac.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Could not create user",
				"details": err.Error(),
			})
			return
		}
	} else {
		// User exists, update Google OAuth info if needed
		updates := map[string]interface{}{
			"name":        input.Name,
			"avatar":      input.Avatar,
			"provider":    "google",
			"provider_id": input.ProviderID,
			"updated_at":  time.Now(),
		}

		if err := ac.DB.Model(&user).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Could not update user",
				"details": err.Error(),
			})
			return
		}

		// Refresh user data
		ac.DB.First(&user, user.ID)
	}

	// Generate JWT tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate access token",
			"details": err.Error(),
		})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate refresh token",
			"details": err.Error(),
		})
		return
	}

	// Success response
	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}

	c.JSON(http.StatusOK, response)
}

// Login handles user login
// POST /api/v1/auth/login
func (ac *AuthController) Login(c *gin.Context) {
	type LoginInput struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Find user by email
	var user models.User
	if err := ac.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid credentials",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	// Check password
	if err := user.CheckPassword(input.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
		})
		return
	}

	// Update last login
	user.LastLoginAt = &time.Time{}
	*user.LastLoginAt = time.Now()
	ac.DB.Save(&user)

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate access token",
			"details": err.Error(),
		})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate refresh token",
			"details": err.Error(),
		})
		return
	}

	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}

	c.JSON(http.StatusOK, response)
}

// Register handles user registration
// POST /api/v1/auth/register
func (ac *AuthController) Register(c *gin.Context) {
	type RegisterInput struct {
		Name     string `json:"name" binding:"required,min=2"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := ac.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User with this email already exists",
		})
		return
	}

	// Create new user
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Role:     models.RoleUser,
		Provider: "local",
	}

	// Set password
	if err := user.SetPassword(input.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not hash password",
			"details": err.Error(),
		})
		return
	}

	if err := ac.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not create user",
			"details": err.Error(),
		})
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate access token",
			"details": err.Error(),
		})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate refresh token",
			"details": err.Error(),
		})
		return
	}

	response := AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}

	c.JSON(http.StatusCreated, response)
}

// RefreshToken handles token refresh
// POST /api/v1/auth/refresh
func (ac *AuthController) RefreshToken(c *gin.Context) {
	type RefreshInput struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}

	var input RefreshInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Validate refresh token
	claims, err := auth.ValidateToken(input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Invalid refresh token",
			"details": err.Error(),
		})
		return
	}

	// Check if it's a refresh token
	if claims.Type != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token type",
		})
		return
	}

	// Get user
	var user models.User
	if err := ac.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not found",
		})
		return
	}

	// Generate new access token
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not generate access token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	})
}

// ForgotPassword handles forgot password requests
// POST /api/v1/auth/forgot-password
func (ac *AuthController) ForgotPassword(c *gin.Context) {
	type ForgotPasswordInput struct {
		Email string `json:"email" binding:"required,email"`
	}

	var input ForgotPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Check if user exists
	var user models.User
	if err := ac.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// Don't reveal if email exists or not
		c.JSON(http.StatusOK, gin.H{
			"message": "If the email exists, a reset link has been sent",
		})
		return
	}

	// TODO: Generate reset token and send email
	// For now, just return success
	c.JSON(http.StatusOK, gin.H{
		"message": "If the email exists, a reset link has been sent",
	})
}

// ResetPassword handles password reset
// POST /api/v1/auth/reset-password
func (ac *AuthController) ResetPassword(c *gin.Context) {
	type ResetPasswordInput struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required,min=6"`
	}

	var input ResetPasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// TODO: Implement password reset logic
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Password reset not implemented yet",
	})
}
