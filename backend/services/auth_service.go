package services

import (
	"errors"
	"ku-asset/dto"
	"ku-asset/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService defines the interface for authentication services.
type AuthService interface {
	Login(req *dto.LoginRequest) (*dto.AuthResponse, error)
	Register(req *dto.RegisterRequest) (*dto.UserResponse, error)
	RefreshToken(tokenString string) (string, error)
	FindOrCreateUserByGoogle(req *dto.GoogleOAuthRequest) (*dto.AuthResponse, error)
}

type authService struct {
	db *gorm.DB
}

// NewAuthService is the constructor for authService.
func NewAuthService(db *gorm.DB) AuthService { // 👈 return เป็น interface
	return &authService{db: db}
}

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

	// If user does not exist, create a new one
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// For OAuth users, we can store a placeholder or no password
		// Or handle it based on your security policy
		newUser := models.User{
			Email:  req.Email,
			Name:   req.Name,
			Role:   models.RoleUser, // Assign a default role
			Avatar: req.Avatar,
		}

		if createErr := s.db.Create(&newUser).Error; createErr != nil {
			return nil, errors.New("failed to create user")
		}
		user = newUser // Use the newly created user
	} else if err != nil {
		return nil, errors.New("database error") // Handle other potential DB errors
	}

	// User exists or was just created, now generate tokens
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
		return nil, errors.New("invalid email or password") // Handle case for OAuth users with no password
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
		Role:         models.RoleUser, // ใช้ค่าคงที่จาก model
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
