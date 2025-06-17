package controllers

import (
	"net/http"
	"strconv"
	"time"

	"ku-asset/internal/middleware"
	"ku-asset/internal/models"
	"ku-asset/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RequestController struct {
	requestService *services.RequestService
}

func NewRequestController(requestService *services.RequestService) *RequestController {
	return &RequestController{
		requestService: requestService,
	}
}

// CreateRequest creates a new requisition request
func (rc *RequestController) CreateRequest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	var req struct {
		Purpose  string `json:"purpose" binding:"required"`
		Notes    string `json:"notes"`
		Priority string `json:"priority"`
		Items    []struct {
			ProductID string `json:"product_id" binding:"required"`
			Quantity  int    `json:"quantity" binding:"required,min=1"`
			Purpose   string `json:"purpose"`
			Notes     string `json:"notes"`
		} `json:"items" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// Convert to service model
	createRequest := services.CreateRequestData{
		UserID:   userID.(string),
		Purpose:  req.Purpose,
		Notes:    req.Notes,
		Priority: req.Priority,
		Items:    make([]services.CreateRequestItem, len(req.Items)),
	}

	for i, item := range req.Items {
		createRequest.Items[i] = services.CreateRequestItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Purpose:   item.Purpose,
			Notes:     item.Notes,
		}
	}

	request, err := rc.requestService.CreateRequest(createRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create request",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"request": request,
		"message": "Request created successfully",
	})
}

// GetMyRequests returns current user's requests
func (rc *RequestController) GetMyRequests(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	requests, total, err := rc.requestService.GetUserRequests(userID.(string), services.RequestFilter{
		Status: status,
		Page:   page,
		Limit:  limit,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get requests",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"requests": requests,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// GetAllRequests returns all requests (Admin only)
func (rc *RequestController) GetAllRequests(c *gin.Context) {
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied",
		})
		return
	}

	status := c.Query("status")
	departmentID := c.Query("department_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	requests, total, err := rc.requestService.GetAllRequests(services.RequestFilter{
		Status:       status,
		DepartmentID: departmentID,
		Page:         page,
		Limit:        limit,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get requests",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"requests": requests,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// ApproveRequest approves a request (Admin only)
func (rc *RequestController) ApproveRequest(c *gin.Context) {
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied",
		})
		return
	}

	requestID := c.Param("id")
	adminID := c.GetString("user_id")

	var req struct {
		Notes string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	err := rc.requestService.ApproveRequest(requestID, adminID, req.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to approve request",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request approved successfully",
	})
}

// RejectRequest rejects a request (Admin only)
func (rc *RequestController) RejectRequest(c *gin.Context) {
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Access denied",
		})
		return
	}

	requestID := c.Param("id")
	adminID := c.GetString("user_id")

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	err := rc.requestService.RejectRequest(requestID, adminID, req.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to reject request",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request rejected successfully",
	})
}

// GetRequest returns a specific request by ID
// GET /api/v1/requests/:id
func (rc *RequestController) GetRequest(c *gin.Context) {
	requestID := c.Param("id")
	userID, _ := middleware.GetUserID(c)
	userRole, _ := middleware.GetUserRole(c)

	var request models.Request
	query := rc.requestService.GetDB().Preload("User").Preload("Items.Product").Preload("ApprovedBy")

	// Non-admin users can only see their own requests
	if userRole != models.RoleAdmin {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Where("id = ?", requestID).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"request": request})
}

// CancelRequest cancels a pending request
// PUT /api/v1/requests/:id/cancel
func (rc *RequestController) CancelRequest(c *gin.Context) {
	requestID := c.Param("id")
	userID, _ := middleware.GetUserID(c)

	var request models.Request
	if err := rc.requestService.GetDB().Where("id = ? AND user_id = ?", requestID, userID).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	// Only pending requests can be cancelled
	if request.Status != models.RequestStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only pending requests can be cancelled",
		})
		return
	}

	// TODO: Implement cancel logic (restore product quantities, etc.)
	// For now, just update status
	if err := rc.requestService.GetDB().Model(&request).Update("status", "CANCELLED").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to cancel request",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request cancelled successfully",
	})
}

// GetRequestDetails returns detailed request information (Admin only)
// GET /api/v1/admin/requests/:id
func (rc *RequestController) GetRequestDetails(c *gin.Context) {
	requestID := c.Param("id")

	var request models.Request
	if err := rc.requestService.GetDB().Preload("User.Department").
		Preload("Items.Product.Category").
		Preload("ApprovedBy").
		Preload("IssuedBy").
		Where("id = ?", requestID).First(&request).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"request": request})
}

// IssueRequest issues an approved request (Admin only)
// PUT /api/v1/admin/requests/:id/issue
func (rc *RequestController) IssueRequest(c *gin.Context) {
	requestID := c.Param("id")
	adminID, _ := middleware.GetUserID(c)

	type IssueRequestInput struct {
		Notes string `json:"notes"`
	}

	var input IssueRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid input format",
			"details": err.Error(),
		})
		return
	}

	// TODO: Implement issue logic
	now := time.Now()
	if err := rc.requestService.GetDB().Model(&models.Request{}).
		Where("id = ? AND status = ?", requestID, models.RequestStatusApproved).
		Updates(map[string]interface{}{
			"status":       models.RequestStatusIssued,
			"issued_by_id": adminID,
			"issued_date":  &now,
			"admin_note":   input.Notes,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to issue request",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request issued successfully",
	})
}

// CompleteRequest completes an issued request (Admin only)
// PUT /api/v1/admin/requests/:id/complete
func (rc *RequestController) CompleteRequest(c *gin.Context) {
	requestID := c.Param("id")

	now := time.Now()
	if err := rc.requestService.GetDB().Model(&models.Request{}).
		Where("id = ? AND status = ?", requestID, models.RequestStatusIssued).
		Updates(map[string]interface{}{
			"status":         models.RequestStatusCompleted,
			"completed_date": &now,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to complete request",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request completed successfully",
	})
}
