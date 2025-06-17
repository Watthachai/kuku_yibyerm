package controllers

import (
	"net/http"

	"ku-asset/internal/middleware"
	"ku-asset/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	DB *gorm.DB
}

func NewUserController(db *gorm.DB) *UserController {
	return &UserController{DB: db}
}

// GetProfile returns the current user's profile
// GET /api/v1/users/profile
func (uc *UserController) GetProfile(c *gin.Context) {
	// Get user ID from middleware context
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "User not authenticated",
			"details": err.Error(),
		})
		return
	}

	// Find user in database
	var user models.User
	if err := uc.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// UpdateProfile updates the current user's profile
// PUT /api/v1/users/profile
func (uc *UserController) UpdateProfile(c *gin.Context) {
	type UpdateProfileInput struct {
		Name   string  `json:"name" binding:"required,min=2"`
		Avatar *string `json:"avatar"`
	}

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "User not authenticated",
			"details": err.Error(),
		})
		return
	}

	// Update user
	var user models.User
	if err := uc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update fields
	user.Name = input.Name
	if input.Avatar != nil {
		user.Avatar = input.Avatar
	}

	if err := uc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update profile",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

// ChangePassword changes user's password
// POST /api/v1/users/change-password
func (uc *UserController) ChangePassword(c *gin.Context) {
	type ChangePasswordInput struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=6"`
	}

	var input ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "User not authenticated",
			"details": err.Error(),
		})
		return
	}

	var user models.User
	if err := uc.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check current password
	if err := user.CheckPassword(input.CurrentPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Current password is incorrect",
		})
		return
	}

	// Set new password
	if err := user.SetPassword(input.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not update password",
			"details": err.Error(),
		})
		return
	}

	if err := uc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update password",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password updated successfully",
	})
}

// GetAllUsers returns all users (Admin only)
// GET /api/v1/admin/users
func (uc *UserController) GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := uc.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch users",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"count": len(users),
	})
}

// GetUser returns a specific user by ID (Admin only)
// GET /api/v1/admin/users/:id
func (uc *UserController) GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := uc.DB.Preload("Department").First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// UpdateUser updates a user (Admin only)
// PUT /api/v1/admin/users/:id
func (uc *UserController) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	type UpdateUserInput struct {
		Name         string `json:"name"`
		Role         string `json:"role"`
		DepartmentID *uint  `json:"departmentId"`
		IsActive     *bool  `json:"isActive"`
	}

	var input UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	var user models.User
	if err := uc.DB.First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	// Update fields
	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Role != "" {
		user.Role = models.Role(input.Role)
	}
	if input.DepartmentID != nil {
		user.DepartmentID = input.DepartmentID
	}
	if input.IsActive != nil {
		user.IsActive = *input.IsActive
	}

	if err := uc.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update user",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user":    user,
	})
}

// DeleteUser soft deletes a user (Admin only)
// DELETE /api/v1/admin/users/:id
func (uc *UserController) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := uc.DB.First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	if err := uc.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete user",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})
}

// ActivateUser activates a user (Admin only)
// PUT /api/v1/admin/users/:id/activate
func (uc *UserController) ActivateUser(c *gin.Context) {
	id := c.Param("id")

	if err := uc.DB.Model(&models.User{}).Where("id = ?", id).Update("is_active", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to activate user",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User activated successfully",
	})
}

// DeactivateUser deactivates a user (Admin only)
// PUT /api/v1/admin/users/:id/deactivate
func (uc *UserController) DeactivateUser(c *gin.Context) {
	id := c.Param("id")

	if err := uc.DB.Model(&models.User{}).Where("id = ?", id).Update("is_active", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to deactivate user",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deactivated successfully",
	})
}
