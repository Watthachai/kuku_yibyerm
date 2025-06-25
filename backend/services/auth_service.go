package services

import (
	// --- IMPORT ที่ต้องเพิ่ม ---
	"context"
	"crypto/tls" // 👈 เพิ่ม import นี้
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"      // 👈 เพิ่ม import นี้
	"net/http" // 👈 เพิ่ม import นี้

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	// --------------------------

	"errors"
	"ku-asset/dto"
	"ku-asset/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService interface (เหมือนเดิม)
type AuthService interface {
	Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
	Register(req *dto.RegisterRequest) (*dto.UserResponse, error)
	RefreshToken(tokenString string) (string, error)
	FindOrCreateUserByGoogle(req *dto.GoogleOAuthRequest) (*dto.AuthResponse, error)
	HandleGoogleCallback(code string, state string) (*dto.AuthResponse, error)
}

type authService struct {
	db                *gorm.DB
	googleOauthConfig *oauth2.Config
}

// NewAuthService (เหมือนเดิม)
func NewAuthService(db *gorm.DB) AuthService {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  "https://backend-go-production-2ba8.up.railway.app/api/auth/callback/google",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &authService{
		db:                db,
		googleOauthConfig: conf,
	}
}

// ⭐⭐⭐ แก้ไขฟังก์ชันนี้ที่เดียว ⭐⭐⭐
func (s *authService) HandleGoogleCallback(code string, state string) (*dto.AuthResponse, error) {
	// ============================ EMERGENCY FIX FOR PRESENTATION ============================
	// สร้าง HTTP Client ที่ไม่ตรวจสอบใบรับรองความปลอดภัย (TLS/SSL)
	// นี่คือการแก้ปัญหา "x509: certificate signed by unknown authority" แบบฉุกเฉิน
	// คำเตือน: ไม่ปลอดภัยสำหรับการใช้งานจริง! ต้องเอาออกหลังพรีเซนต์เสร็จ
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	ctx := context.WithValue(context.Background(), oauth2.HTTPClient, client)
	// ========================================================================================

	// 1. แลก "code" เป็น "token" จาก Google โดยใช้ client ที่เราสร้างขึ้น
	token, err := s.googleOauthConfig.Exchange(ctx, code)
	if err != nil {
		log.Printf("🔴 FAILED TO EXCHANGE TOKEN: %v", err) // Log error เพื่อดูสาเหตุ
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}

	log.Printf("✅ TOKEN EXCHANGED SUCCESSFULLY")

	// 2. ใช้ "token" เพื่อยิง request ไปขอข้อมูลผู้ใช้จาก Google
	// เราจะใช้ client ที่ไม่ปลอดภัยตัวเดิมสำหรับขั้นตอนนี้ด้วย
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo?access_token="+token.AccessToken, nil)
	if err != nil {
		log.Printf("🔴 FAILED TO CREATE USERINFO REQUEST: %v", err)
		return nil, fmt.Errorf("failed to create user info request: %w", err)
	}

	response, err := client.Do(req)
	if err != nil {
		log.Printf("🔴 FAILED TO GET USER INFO: %v", err)
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer response.Body.Close()

	log.Printf("✅ GOT USER INFO RESPONSE, STATUS: %s", response.Status)

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Printf("🔴 FAILED TO READ USERINFO RESPONSE BODY: %v", err)
		return nil, fmt.Errorf("failed to read user info response: %w", err)
	}

	// 3. แปลงข้อมูลผู้ใช้ (JSON) มาเป็น struct
	var googleUser dto.GoogleOAuthRequest
	if err := json.Unmarshal(contents, &googleUser); err != nil {
		log.Printf("🔴 FAILED TO UNMARSHAL USERINFO: %v", err)
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	log.Printf("✅ USER INFO PARSED: %+v", googleUser)

	// 4. เรียกใช้ฟังก์ชันเดิมเพื่อสร้าง/ค้นหาผู้ใช้ และสร้าง JWT ของเราเอง
	return s.FindOrCreateUserByGoogle(&googleUser)
}

// --- โค้ดเดิมของคุณทั้งหมด ไม่ต้องแก้ไข ---
// (ใส่โค้ด Login, Register, FindOrCreateUserByGoogle, RefreshToken, generateAccessToken, generateRefreshToken ของคุณที่นี่)

// RefreshToken validates the refresh token and issues a new access token.
func (s *authService) RefreshToken(tokenString string) (string, error) {
	secret := os.Getenv("JWT_REFRESH_SECRET")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return "", errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid token claims")
	}

	userID := uint(claims["user_id"].(float64))
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return "", errors.New("user not found")
	}

	// Generate new access token
	return s.generateAccessToken(user)
}

// FindOrCreateUserByGoogle handles logic for Google OAuth.
func (s *authService) FindOrCreateUserByGoogle(req *dto.GoogleOAuthRequest) (*dto.AuthResponse, error) {
	var user models.User
	err := s.db.Where("email = ?", req.Email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newUser := models.User{
			Email:  req.Email,
			Name:   req.Name,
			Role:   models.RoleUser,
			Avatar: req.Avatar,
		}

		if createErr := s.db.Create(&newUser).Error; createErr != nil {
			return nil, errors.New("failed to create user")
		}
		user = newUser
	} else if err != nil {
		return nil, errors.New("database error")
	}

	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	authResponse := &dto.AuthResponse{
		User: dto.UserResponse{
			ID:           user.ID,
			Email:        user.Email,
			Name:         user.Name,
			Role:         string(user.Role),
			DepartmentID: user.DepartmentID,
			Avatar:       user.Avatar,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return authResponse, nil
}

// Login handles the user login logic.
func (s *authService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	if user.Password == nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	authResponse := &dto.AuthResponse{
		User: dto.UserResponse{
			ID:           user.ID,
			Email:        user.Email,
			Name:         user.Name,
			Role:         string(user.Role),
			DepartmentID: user.DepartmentID,
			Avatar:       user.Avatar,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return authResponse, nil
}

// Register handles the user registration logic.
func (s *authService) Register(req *dto.RegisterRequest) (*dto.UserResponse, error) {
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}
	hashedPasswordStr := string(hashedPassword)

	var deptID *uint
	if req.DepartmentID != 0 {
		deptID = &req.DepartmentID
	}

	user := models.User{
		Email:        req.Email,
		Password:     &hashedPasswordStr,
		Name:         req.Name,
		Role:         models.RoleUser,
		DepartmentID: deptID,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, errors.New("failed to create user")
	}

	userResponse := &dto.UserResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Role:         string(user.Role),
		DepartmentID: user.DepartmentID,
	}

	return userResponse, nil
}

// --- Helper methods for token generation ---
func (s *authService) generateAccessToken(user models.User) (string, error) {
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

func (s *authService) generateRefreshToken(user models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_REFRESH_SECRET")
	return token.SignedString([]byte(secret))
}
