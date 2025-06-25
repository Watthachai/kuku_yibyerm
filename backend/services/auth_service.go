package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"ku-asset/dto"
	"ku-asset/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

// AuthService interface
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

// NewAuthService constructor
func NewAuthService(db *gorm.DB) AuthService {
	conf := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URI"), // อ่านจาก Env ที่ถูกต้อง
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

// HandleGoogleCallback (ฉบับปกติและปลอดภัย)
func (s *authService) HandleGoogleCallback(code string, state string) (*dto.AuthResponse, error) {
	token, err := s.googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user info response: %w", err)
	}

	var googleUser dto.GoogleOAuthRequest
	if err := json.Unmarshal(contents, &googleUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	return s.FindOrCreateUserByGoogle(&googleUser)
}

// โค้ดส่วนที่เหลือของคุณ... (Login, Register, etc.)
// ... (วางโค้ดส่วนที่เหลือของไฟล์ auth_service.go ของคุณที่นี่) ...
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

	return s.generateAccessToken(user)
}

func (s *authService) FindOrCreateUserByGoogle(req *dto.GoogleOAuthRequest) (*dto.AuthResponse, error) {
	var user models.User
	err := s.db.Where("email = ?", req.Email).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newUser := models.User{
			Email:    req.Email,
			Name:     req.Name,
			Role:     models.RoleUser,
			Avatar:   req.Avatar,
			Provider: "google",
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
