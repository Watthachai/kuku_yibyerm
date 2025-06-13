// backend/internal/controllers/auth.go
package controllers

import (
	"net/http"
	"time"

	"kuku-yipyerm/internal/auth"
	"kuku-yipyerm/internal/models"

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
