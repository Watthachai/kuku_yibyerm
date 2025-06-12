package controllers

import (
	"net/http"
	"time"

	"kuku-yipyerm/internal/auth" // เปลี่ยนจาก domain/auth
	"kuku-yipyerm/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthController handles authentication requests.
type AuthController struct {
	DB *gorm.DB
}

// NewAuthController creates a new AuthController.
func NewAuthController(db *gorm.DB) *AuthController {
	return &AuthController{DB: db}
}

// SignInInput defines the structure for the sign-in request body.
type SignInInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// SignUpInput defines the structure for the sign-up request body.
type SignUpInput struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// AuthResponse defines the response structure for authentication
type AuthResponse struct {
	AccessToken  string      `json:"accessToken"`
	RefreshToken string      `json:"refreshToken"`
	User         models.User `json:"user"`
}

// SignIn handles user login.
// POST /api/v1/auth/sign-in
func (ac *AuthController) SignIn(c *gin.Context) {
	var input SignInInput

	// Validate input from JSON body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Find the user by email
	var user models.User
	if err := ac.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user has a password (for OAuth users)
	if user.Password == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Please sign in with your Google account",
		})
		return
	}

	// Check if the password is correct
	if err := user.CheckPassword(input.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
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

// SignUp handles user registration.
// POST /api/v1/auth/sign-up
func (ac *AuthController) SignUp(c *gin.Context) {
	var input SignUpInput

	// Validate input from JSON body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := ac.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not hash password",
			"details": err.Error(),
		})
		return
	}

	hashedPasswordStr := string(hashedPassword)

	// Create new user
	user := models.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  &hashedPasswordStr,
		Role:      models.UserRole,
		Provider:  "local",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save user to database
	if err := ac.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not create user",
			"details": err.Error(),
		})
		return
	}

	// Generate JWT tokens for immediate login
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

	c.JSON(http.StatusCreated, response)
}

// RefreshTokenInput defines the structure for the refresh token request
type RefreshTokenInput struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// RefreshToken handles token refresh
// POST /api/v1/auth/refresh
func (ac *AuthController) RefreshToken(c *gin.Context) {
	var input RefreshTokenInput

	// Validate input from JSON body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// Generate new access token
	newAccessToken, err := auth.RefreshAccessToken(input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Invalid refresh token",
			"details": err.Error(),
		})
		return
	}

	// Success response
	c.JSON(http.StatusOK, gin.H{
		"accessToken": newAccessToken,
	})
}
