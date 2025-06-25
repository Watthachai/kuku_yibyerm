// controllers/auth_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService services.AuthService
}

func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

// Login handles user login.
func (ctrl *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	authResponse, err := ctrl.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": err.Error()})
		return
	}

	// ⭐ แก้ไข Response ของ Login ให้เหมือนกับ GoogleOAuth
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "Login successful",
		"user":          authResponse.User,
		"access_token":  authResponse.AccessToken,
		"refresh_token": authResponse.RefreshToken,
	})
}

// Register handles user registration.
func (ctrl *AuthController) Register(c *gin.Context) {
	// ... (โค้ด Register เหมือนเดิม) ...
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	userResponse, err := ctrl.authService.Register(&req)
	if err != nil {
		if err.Error() == "user already exists" {
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "User created successfully", "data": userResponse})
}

// RefreshToken handles token refresh.
func (ctrl *AuthController) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	newAccessToken, err := ctrl.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"access_token": newAccessToken,
		},
	})
}

// GoogleOAuth handles Google OAuth login/registration.
func (ctrl *AuthController) GoogleOAuth(c *gin.Context) {
	var req dto.GoogleOAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	authResponse, err := ctrl.authService.FindOrCreateUserByGoogle(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	// ⭐ ส่ง Response กลับแบบนี้แค่ครั้งเดียว
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "Google OAuth successful",
		"user":          authResponse.User,
		"access_token":  authResponse.AccessToken,
		"refresh_token": authResponse.RefreshToken,
	})
}

// GoogleOAuthCallback handles Google OAuth callback (GET)
func (ctrl *AuthController) GoogleOAuthCallback(c *gin.Context) {
	// ดึง code, state จาก query string
	code := c.Query("code")
	state := c.Query("state")

	// ตัวอย่าง: log ข้อมูลและตอบกลับ 200 OK (สามารถปรับ logic ได้ภายหลัง)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google OAuth callback received",
		"code":    code,
		"state":   state,
	})
}
