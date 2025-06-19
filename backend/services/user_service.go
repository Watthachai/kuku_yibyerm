// services/user_service.go
package services

import (
	"errors"
	"ku-asset/dto"
	"ku-asset/models"
	"math"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserService defines the interface for all user-related services.
type UserService interface {
	// General User methods
	GetUserByID(id uint) (*dto.UserProfileResponse, error)
	UpdateUserProfile(id uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error)
	ChangePassword(id uint, req *dto.ChangePasswordRequest) error

	// Admin methods
	GetUsers(req *dto.PaginationRequest) (*dto.PaginatedUserResponse, error)
	AdminUpdateUser(id uint, req *dto.AdminUpdateUserRequest) (*dto.UserProfileResponse, error)
	DeleteUser(id uint) error
}

type userService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) UserService {
	return &userService{db: db}
}

// --- General User Methods ---
func (s *userService) GetUserByID(id uint) (*dto.UserProfileResponse, error) {
	var user models.User
	if err := s.db.Preload("Department").First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return mapUserToProfileResponse(&user), nil
}

func (s *userService) UpdateUserProfile(id uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}

	user.Name = req.Name
	if req.Avatar != nil {
		user.Avatar = req.Avatar
	}
	if err := s.db.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update profile")
	}
	return s.GetUserByID(id)
}

func (s *userService) ChangePassword(id uint, req *dto.ChangePasswordRequest) error {
	// ... (logic for changing password remains the same as previous answer)
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return errors.New("user not found")
	}
	if user.Password == nil {
		return errors.New("cannot change password for OAuth user")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.CurrentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("could not hash new password")
	}
	newPasswordStr := string(newHashedPassword)
	user.Password = &newPasswordStr
	if err := s.db.Save(&user).Error; err != nil {
		return errors.New("failed to update password in database")
	}
	return nil
}

// --- Admin Methods ---
func (s *userService) GetUsers(req *dto.PaginationRequest) (*dto.PaginatedUserResponse, error) {
	var users []models.User
	var total int64

	if err := s.db.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, errors.New("failed to count users")
	}

	offset := (req.Page - 1) * req.Limit
	if err := s.db.Offset(offset).Limit(req.Limit).Find(&users).Error; err != nil {
		return nil, errors.New("failed to fetch users")
	}

	var userResponses []dto.UserProfileResponse
	for _, user := range users {
		userResponses = append(userResponses, *mapUserToProfileResponse(&user))
	}

	return &dto.PaginatedUserResponse{
		Users: userResponses,
		Pagination: dto.PaginationResponse{
			CurrentPage: req.Page,
			PerPage:     req.Limit,
			Total:       total,
			TotalPages:  int64(math.Ceil(float64(total) / float64(req.Limit))),
		},
	}, nil
}

func (s *userService) AdminUpdateUser(id uint, req *dto.AdminUpdateUserRequest) (*dto.UserProfileResponse, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Role != "" {
		user.Role = models.Role(req.Role)
	}
	if req.DepartmentID != nil {
		user.DepartmentID = req.DepartmentID
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update user")
	}
	return s.GetUserByID(id)
}

func (s *userService) DeleteUser(id uint) error {
	// GORM's Delete performs a soft delete if the model has gorm.DeletedAt
	if err := s.db.Delete(&models.User{}, id).Error; err != nil {
		return errors.New("failed to delete user")
	}
	return nil
}

// --- Helper function to map model to DTO ---
func mapUserToProfileResponse(user *models.User) *dto.UserProfileResponse {
	return &dto.UserProfileResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Role:         string(user.Role),
		IsActive:     user.IsActive,
		DepartmentID: user.DepartmentID,
		Avatar:       user.Avatar,
	}
}
