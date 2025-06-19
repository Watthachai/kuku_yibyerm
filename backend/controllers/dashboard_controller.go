// controllers/dashboard_controller.go
package controllers

import (
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ⭐ แก้ไข Struct และ Constructor
type DashboardController struct {
	dashboardService services.DashboardService
}

func NewDashboardController(dashboardService services.DashboardService) *DashboardController {
	return &DashboardController{dashboardService: dashboardService}
}

// ⭐ แก้ไข Method ให้เรียกใช้ Service
func (ctrl *DashboardController) GetAdminStats(c *gin.Context) {
	stats, err := ctrl.dashboardService.GetAdminStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get admin stats"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}
