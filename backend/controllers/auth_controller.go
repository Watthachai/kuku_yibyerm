// controllers/auth_controller.go
package controllers

import (
	"fmt"
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

func (ctrl *AuthController) GoogleCallbackHandler(c *gin.Context) {
	// 1. ดึง "code" ที่ Google ส่งกลับมาให้จาก URL Query Parameter
	code := c.Query("code")
	state := c.Query("state") // ปกติ Google จะส่ง state กลับมาด้วย ควรเช็คว่าตรงกับที่ส่งไปตอนแรก

	if code == "" {
		// ถ้าไม่ได้ code กลับมา แสดงว่ามีปัญหา
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Authorization code not provided by Google"})
		return
	}

	// 2. เรียก Service เพื่อนำ "code" ไปแลกเป็น Access Token กับ Google
	//    แล้วใช้ Access Token นั้นไปขอข้อมูลผู้ใช้ (ขั้นตอนนี้จะอยู่ใน Service)
	//    สุดท้าย Service จะสร้าง User ในระบบและสร้าง JWT ของเราเอง
	//    *** คุณต้องไปสร้างฟังก์ชัน HandleGoogleCallback ใน authService ของคุณ ***
	authResponse, err := ctrl.authService.HandleGoogleCallback(code, state)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	// 3. เมื่อทุกอย่างสำเร็จ ให้ Redirect ผู้ใช้กลับไปที่ Frontend พร้อมกับ Token ของเรา
	//    เพื่อให้ Frontend รับ Token ไปเก็บแล้วเปลี่ยนหน้าเป็นหน้า "ล็อกอินสำเร็จ"
	frontendURL := "https://kukuyibyerm-production.up.railway.app/auth-success" // หรือหน้าอื่นๆ ที่คุณต้องการ
	redirectURL := fmt.Sprintf("%s?access_token=%s&refresh_token=%s", frontendURL, authResponse.AccessToken, authResponse.RefreshToken)

	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}
