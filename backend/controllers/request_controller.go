package controllers

import (
	"log"
	"net/http"
	"strconv"

	"ku-asset/dto"
	"ku-asset/middleware"
	"ku-asset/services"

	"github.com/gin-gonic/gin"
)

type RequestController struct {
	requestService services.RequestService
}

func NewRequestController(requestService services.RequestService) *RequestController {
	return &RequestController{
		requestService: requestService,
	}
}

// CreateRequest สร้างคำขอเบิกใหม่
func (rc *RequestController) CreateRequest(c *gin.Context) {
	log.Println("🔍 CreateRequest controller called")

	var input dto.CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("❌ JSON binding failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	log.Printf("✅ Request input parsed: %+v", input)

	// ดึง user ID จาก token
	log.Println("🔍 Attempting to get userID from context")
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		log.Printf("❌ Failed to get userID from context: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Invalid user ID in token",
		})
		return
	}

	log.Printf("✅ UserID extracted: %d", userID)

	// สร้างคำขอ
	request, err := rc.requestService.CreateRequest(userID, &input)
	if err != nil {
		log.Printf("❌ Failed to create request: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create request",
			"message": err.Error(),
		})
		return
	}

	log.Printf("✅ Request created successfully: %+v", request)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Request created successfully",
		"data":    request,
	})
}

// ⭐ เพิ่ม GetMyRequests สำหรับ User ดูคำขอของตัวเอง
func (rc *RequestController) GetMyRequests(c *gin.Context) {
	// ดึง user ID จาก token
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Invalid user ID in token",
		})
		return
	}

	// ดึงคำขอทั้งหมดของ user
	requests, err := rc.requestService.GetRequestsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get requests",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Requests retrieved successfully",
		"data": gin.H{
			"requests": requests,
		},
	})
}

// GetRequest ดูรายละเอียดคำขอ (ตรวจสอบเป็นของ user คนนั้นหรือไม่)
func (rc *RequestController) GetRequest(c *gin.Context) {
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request ID",
			"message": "Request ID must be a number",
		})
		return
	}

	// ดึง user ID จาก token
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Invalid user ID in token",
		})
		return
	}

	// ดึงรายละเอียดคำขอ
	request, err := rc.requestService.GetRequestByID(uint(requestID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Request not found",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบว่าคำขอนี้เป็นของ user คนนี้หรือไม่
	if request.User.ID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Access denied",
			"message": "You can only view your own requests",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request retrieved successfully",
		"data":    request,
	})
}

// GetAllRequests สำหรับ Admin ดูคำขอทั้งหมด
func (rc *RequestController) GetAllRequests(c *gin.Context) {
	requests, err := rc.requestService.GetAllRequests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get requests",
			"message": err.Error(),
		})
		return
	}

	// ⭐ แก้ไขให้ส่ง requests โดยตรงเหมือน endpoint อื่นๆ
	c.JSON(http.StatusOK, gin.H{
		"message": "All requests retrieved successfully",
		"data":    requests, // ⭐ ส่ง array โดยตรง ไม่ห่อใน object
	})
}

// UpdateRequestStatus สำหรับ Admin อัปเดตสถานะคำขอ
func (rc *RequestController) UpdateRequestStatus(c *gin.Context) {
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request ID",
			"message": "Request ID must be a number",
		})
		return
	}

	var input dto.UpdateRequestStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	request, err := rc.requestService.UpdateRequestStatus(uint(requestID), input.Status, input.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update request status",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Request status updated successfully",
		"data":    request,
	})
}

// ⭐ เพิ่มฟังก์ชันนี้ใน RequestController
func (rc *RequestController) DownloadRequestPDF(c *gin.Context) {
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	req, err := rc.requestService.GetRequestByID(uint(requestID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}

	pdfBytes, err := rc.requestService.GenerateRequestPDF(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=request_receipt.pdf")
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
