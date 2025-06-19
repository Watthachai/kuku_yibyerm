// controllers/request_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/middleware"
	"ku-asset/models"
	"ku-asset/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RequestController struct {
	requestService services.RequestService
}

func NewRequestController(requestService services.RequestService) *RequestController {
	return &RequestController{requestService: requestService}
}

func (ctrl *RequestController) CreateRequest(c *gin.Context) {
	var req dto.CreateRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	userID, _ := middleware.GetUserID(c)

	newRequest, err := ctrl.requestService.CreateRequest(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": newRequest})
}

func (ctrl *RequestController) UpdateRequestStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}
	adminID, _ := middleware.GetUserID(c)

	var req dto.AdminUpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	updatedRequest, err := ctrl.requestService.UpdateRequestStatus(uint(id), adminID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": updatedRequest})
}

func (ctrl *RequestController) GetRequest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}
	userID, _ := middleware.GetUserID(c)
	userRoleStr, _ := middleware.GetUserRole(c)
	userRole := models.Role(userRoleStr)

	request, err := ctrl.requestService.GetRequestByID(uint(id), userID, userRole)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": request})
}
