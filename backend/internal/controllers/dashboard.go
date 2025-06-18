package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	// เพิ่ม dependencies ถ้าต้องการ
}

func NewDashboardController() *DashboardController {
	return &DashboardController{}
}

// GetAdminStats returns admin dashboard statistics
func (dc *DashboardController) GetAdminStats(c *gin.Context) {
	// Mock data สำหรับทดสอบ
	stats := gin.H{
		"totalUsers":       89,
		"totalItems":       156,
		"pendingRequests":  12,
		"approvedRequests": 45,
		"rejectedRequests": 3,
		"activeUsers":      67,
		"totalDepartments": 15,
		"monthlyRequests":  28,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// GetRecentActivity returns recent system activity
func (dc *DashboardController) GetRecentActivity(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	// Mock data
	activities := []gin.H{
		{
			"id":   "1",
			"type": "REQUEST",
			"user": gin.H{
				"id":         "1",
				"name":       "นาย สมชาย ใจดี",
				"email":      "somchai@ku.ac.th",
				"department": "คณะเกษตร",
			},
			"item": gin.H{
				"id":   "1",
				"name": "เครื่องฉายภาพ Epson",
			},
			"message":   "ส่งคำขอยืมเครื่องฉายภาพ Epson",
			"timestamp": "2025-06-18T12:00:00Z",
		},
		{
			"id":   "2",
			"type": "APPROVAL",
			"user": gin.H{
				"id":         "2",
				"name":       "อาจารย์ สุวิทย์",
				"email":      "suwit@ku.ac.th",
				"department": "คณะเกษตร",
			},
			"item": gin.H{
				"id":   "2",
				"name": "เครื่องพิมพ์ Canon",
			},
			"message":   "อนุมัติคำขอยืมเครื่องพิมพ์ Canon",
			"timestamp": "2025-06-18T11:30:00Z",
		},
	}

	// จำกัดจำนวนตาม limit
	if limit < len(activities) {
		activities = activities[:limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    activities,
	})
}

// GetSystemStats returns system statistics
func (dc *DashboardController) GetSystemStats(c *gin.Context) {
	// Mock data
	systemStats := gin.H{
		"requestsByMonth": []gin.H{
			{"month": "ม.ค.", "count": 25},
			{"month": "ก.พ.", "count": 30},
			{"month": "มี.ค.", "count": 28},
			{"month": "เม.ย.", "count": 35},
			{"month": "พ.ค.", "count": 42},
			{"month": "มิ.ย.", "count": 38},
		},
		"topRequestedItems": []gin.H{
			{"name": "เครื่องฉายภาพ", "count": 15},
			{"name": "เครื่องพิมพ์", "count": 10},
			{"name": "คอมพิวเตอร์", "count": 8},
			{"name": "กล้องถ่ายรูป", "count": 6},
			{"name": "ไมโครโฟน", "count": 4},
		},
		"departmentUsage": []gin.H{
			{"department": "คณะเกษตร", "count": 20},
			{"department": "คณะวิศวกรรม", "count": 15},
			{"department": "คณะศึกษาศาสตร์", "count": 12},
			{"department": "คณะบริหารธุรกิจ", "count": 10},
			{"department": "คณะมนุษยศาสตร์", "count": 8},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    systemStats,
	})
}
