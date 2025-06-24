// services/user_service.go
package services

import (
	"errors"
	"fmt"
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
	GetUserStats(id uint) (*dto.UserStatsResponse, error)

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

	fmt.Printf("🔍 GetUserByID Debug - User: %+v\n", user)
	fmt.Printf("🔍 DepartmentID: %v (type: %T)\n", user.DepartmentID, user.DepartmentID)

	response := mapUserToProfileResponse(&user, s.db)
	fmt.Printf("🔍 Response: %+v\n", response)

	return response, nil
}

func (s *userService) UpdateUserProfile(id uint, req *dto.UpdateProfileRequest) (*dto.UserProfileResponse, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Update fields only if provided
	if req.Name != nil && *req.Name != "" {
		user.Name = *req.Name
	}

	if req.Phone != nil {
		user.Phone = req.Phone
	}

	// Handle DepartmentID - support both setting and clearing
	fmt.Printf("🏢 Department update: req.DepartmentID = %v\n", req.DepartmentID)
	user.DepartmentID = req.DepartmentID // จะเป็น nil หากต้องการ clear
	fmt.Printf("🏢 After setting: user.DepartmentID = %v\n", user.DepartmentID)

	if req.Avatar != nil {
		user.Avatar = req.Avatar
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update profile")
	}

	return s.GetUserByID(id)
}

func (s *userService) ChangePassword(id uint, req *dto.ChangePasswordRequest) error {
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

func (s *userService) GetUserStats(id uint) (*dto.UserStatsResponse, error) {
	var stats dto.UserStatsResponse

	// Get total requests count
	var totalCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ?", id).Count(&totalCount).Error; err != nil {
		return nil, errors.New("failed to get total requests count")
	}
	stats.TotalRequests = int(totalCount)

	// Get pending requests count
	var pendingCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ? AND status = ?", id, "PENDING").Count(&pendingCount).Error; err != nil {
		return nil, errors.New("failed to get pending requests count")
	}
	stats.PendingRequests = int(pendingCount)

	// Get approved requests count
	var approvedCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ? AND status = ?", id, "APPROVED").Count(&approvedCount).Error; err != nil {
		return nil, errors.New("failed to get approved requests count")
	}
	stats.ApprovedRequests = int(approvedCount)

	// Get rejected requests count
	var rejectedCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ? AND status = ?", id, "REJECTED").Count(&rejectedCount).Error; err != nil {
		return nil, errors.New("failed to get rejected requests count")
	}
	stats.RejectedRequests = int(rejectedCount)

	// Get completed requests count
	var completedCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ? AND status = ?", id, "COMPLETED").Count(&completedCount).Error; err != nil {
		return nil, errors.New("failed to get completed requests count")
	}
	stats.CompletedRequests = int(completedCount)

	// Get borrowed items count (status = ISSUED means currently borrowed)
	var borrowedCount int64
	if err := s.db.Model(&models.Request{}).Where("user_id = ? AND status = ?", id, "ISSUED").Count(&borrowedCount).Error; err != nil {
		return nil, errors.New("failed to get borrowed items count")
	}
	stats.BorrowedItems = int(borrowedCount)

	return &stats, nil
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
		userResponses = append(userResponses, *mapUserToProfileResponse(&user, s.db))
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
func mapUserToProfileResponse(user *models.User, db *gorm.DB) *dto.UserProfileResponse {
	fmt.Printf("🗂️ Mapping user to response - DepartmentID: %v\n", user.DepartmentID)

	response := &dto.UserProfileResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Phone:        user.Phone,
		Role:         string(user.Role),
		IsActive:     user.IsActive,
		DepartmentID: user.DepartmentID,
		Avatar:       user.Avatar,
	}

	// Map Department information if available
	if user.Department != nil {
		fmt.Printf("🏢 Department found: %+v\n", user.Department)

		deptInfo := &dto.DepartmentInfoResponse{
			ID:       user.Department.ID,
			Name:     user.Department.NameTH, // ใช้ NameTH แทน Name
			Code:     user.Department.Code,
			Type:     string(user.Department.Type),
			ParentID: user.Department.ParentID,
		}

		// ถ้าเป็นภาควิชา (มี ParentID) ให้ดึงข้อมูลคณะมาด้วย
		if user.Department.ParentID != nil {
			var parentDept models.Department
			if err := db.Where("id = ?", *user.Department.ParentID).First(&parentDept).Error; err == nil {
				deptInfo.Faculty = &parentDept.NameTH // ใช้ NameTH
				fmt.Printf("🏛️ Faculty found: %s\n", parentDept.NameTH)
			} else {
				fmt.Printf("❌ Failed to find parent department: %v\n", err)
			}
		}

		response.Department = deptInfo
		fmt.Printf("✅ Department mapped successfully: %+v\n", deptInfo)
	} else {
		fmt.Printf("❌ No department found for user\n")
	}

	fmt.Printf("🗂️ Final Response DepartmentID: %v, Department: %+v\n", response.DepartmentID, response.Department)
	return response
}
