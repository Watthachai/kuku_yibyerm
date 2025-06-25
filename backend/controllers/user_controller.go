// controllers/user_controller.go (ฉบับสมบูรณ์)

package controllers

import (
	"fmt"
	"ku-asset/dto"
	"ku-asset/middleware"
	"ku-asset/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService services.UserService
}

func NewUserController(userService services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// --- General User Endpoints ---

func (ctrl *UserController) GetProfile(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	userProfile, err := ctrl.userService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": userProfile})
}

func (ctrl *UserController) UpdateProfile(c *gin.Context) {
	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("🚫 JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input", "details": err.Error()})
		return
	}
	fmt.Printf("📝 Update profile request: %+v\n", req)
	userID, _ := middleware.GetUserID(c)
	updatedUser, err := ctrl.userService.UpdateUserProfile(userID, &req)
	if err != nil {
		fmt.Printf("🚫 Service error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	fmt.Printf("✅ Profile updated successfully: %+v\n", updatedUser)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Profile updated successfully", "data": updatedUser})
}

func (ctrl *UserController) ChangePassword(c *gin.Context) {
	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}
	userID, _ := middleware.GetUserID(c)
	err := ctrl.userService.ChangePassword(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password updated successfully"})
}

func (ctrl *UserController) GetUserStats(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	stats, err := ctrl.userService.GetUserStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

// --- Admin Endpoints ---

func (ctrl *UserController) GetUsers(c *gin.Context) {
	var req dto.PaginationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid query parameters"})
		return
	}
	paginatedResponse, err := ctrl.userService.GetUsers(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": paginatedResponse})
}

func (ctrl *UserController) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user ID"})
		return
	}
	user, err := ctrl.userService.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": user})
}

func (ctrl *UserController) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user ID"})
		return
	}
	var req dto.AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}
	updatedUser, err := ctrl.userService.AdminUpdateUser(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User updated successfully", "data": updatedUser})
}

func (ctrl *UserController) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid user ID"})
		return
	}
	if err := ctrl.userService.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User deleted successfully"})
}
