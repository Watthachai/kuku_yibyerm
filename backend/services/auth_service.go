package services

import (
	// --- IMPORT ที่จำเป็น ---
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

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

// ⭐ 1. เพิ่มเมธอดใหม่ใน Interface
type AuthService interface {
	Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
	Register(req *dto.RegisterRequest) (*dto.UserResponse, error)
	RefreshToken(tokenString string) (string, error)
	FindOrCreateUserByGoogle(req *dto.GoogleOAuthRequest) (*dto.AuthResponse, error)
	HandleGoogleCallback(code string, state string) (*dto.AuthResponse, error) // 👈 เพิ่มบรรทัดนี้
}

// ⭐ 2. เพิ่ม Field สำหรับเก็บค่า Config ของ Google OAuth
type authService struct {
	db                *gorm.DB
	googleOauthConfig *oauth2.Config // 👈 เพิ่มบรรทัดนี้
}

// ⭐ 3. แก้ไข Constructor ให้สร้างและเก็บ Config (พร้อม Hardcode เพื่อ Test)

func NewAuthService(db *gorm.DB) AuthService {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),

		// ⭐ ทำให้ตรงกับความเป็นจริง (เอา v1 ออก) ⭐
		RedirectURL: "https://backend-go-production-2ba8.up.railway.app/api/auth/callback/google",

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

// ⭐ 4. เพิ่มเมธอด HandleGoogleCallback ที่ขาดไป
func (s *authService) HandleGoogleCallback(code string, state string) (*dto.AuthResponse, error) {
	// 1. แลก "code" เป็น "token" จาก Google
	token, err := s.googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}

	// 2. ใช้ "token" เพื่อยิง request ไปขอข้อมูลผู้ใช้จาก Google
	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user info response: %w", err)
	}

	// 3. แปลงข้อมูลผู้ใช้ (JSON) มาเป็น struct
	var googleUser dto.GoogleOAuthRequest
	if err := json.Unmarshal(contents, &googleUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	// 4. เรียกใช้ฟังก์ชันเดิมเพื่อสร้าง/ค้นหาผู้ใช้ และสร้าง JWT ของเราเอง
	return s.FindOrCreateUserByGoogle(&googleUser)
}

// --- โค้ดเดิมของคุณ (ถูกต้องแล้ว ไม่ต้องแก้ไข) ---

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
