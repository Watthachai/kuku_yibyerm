// controllers/dashboard_controller.go
package controllers

import (
	"ku-asset/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	dashboardService services.DashboardService
}

func NewDashboardController(dashboardService services.DashboardService) *DashboardController {
	return &DashboardController{dashboardService: dashboardService}
}

func (ctrl *DashboardController) GetAdminStats(c *gin.Context) {
	stats, err := ctrl.dashboardService.GetAdminStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get admin stats"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

// ⭐ เพิ่ม Handler สำหรับ RecentActivity
func (ctrl *DashboardController) GetRecentActivity(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
	activity, err := ctrl.dashboardService.GetRecentActivity(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get recent activity"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": activity})
}

// ⭐ เพิ่ม Handler สำหรับ SystemStats
func (ctrl *DashboardController) GetSystemStats(c *gin.Context) {
	stats, err := ctrl.dashboardService.GetSystemStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get system stats"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}
