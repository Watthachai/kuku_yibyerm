package controllers

import (
	"net/http"
	"time"

	"kuku-yipyerm/internal/auth"
	"kuku-yipyerm/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OAuthController struct {
	DB *gorm.DB
}

type GoogleOAuthRequest struct {
	Email       string `json:"email" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Avatar      string `json:"avatar"`
	ProviderID  string `json:"providerId" binding:"required"`
	AccessToken string `json:"accessToken" binding:"required"`
}

type OAuthResponse struct {
	AccessToken  string      `json:"accessToken"`
	RefreshToken string      `json:"refreshToken"`
	User         models.User `json:"user"`
	IsNewUser    bool        `json:"isNewUser"`
}

func NewOAuthController(db *gorm.DB) *OAuthController {
	return &OAuthController{DB: db}
}

// GoogleOAuth handles Google OAuth authentication
func (oc *OAuthController) GoogleOAuth(c *gin.Context) {
	var req GoogleOAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Check if user already exists by email or provider ID
	var existingUser models.User
	result := oc.DB.Where("email = ? OR (provider = ? AND provider_id = ?)",
		req.Email, "google", req.ProviderID).First(&existingUser)

	isNewUser := false
	var user models.User

	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		isNewUser = true
		user = models.User{
			Email:      req.Email,
			Name:       req.Name,
			Avatar:     &req.Avatar,
			Provider:   "google",
			ProviderID: &req.ProviderID,
			Role:       models.UserRole, // Default role
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		if err := oc.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create user",
				"details": err.Error(),
			})
			return
		}
	} else if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"details": result.Error.Error(),
		})
		return
	} else {
		// Update existing user information
		user = existingUser
		user.Name = req.Name
		if req.Avatar != "" {
			user.Avatar = &req.Avatar
		}
		user.UpdatedAt = time.Now()

		// Update provider info if it's a local user
		if user.Provider == "local" {
			user.Provider = "google"
			user.ProviderID = &req.ProviderID
		}

		if err := oc.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to update user",
				"details": err.Error(),
			})
			return
		}
	}

	// Generate JWT tokens
	accessToken, err := auth.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate access token",
			"details": err.Error(),
		})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate refresh token",
			"details": err.Error(),
		})
		return
	}

	response := OAuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
		IsNewUser:    isNewUser,
	}

	c.JSON(http.StatusOK, response)
}
