package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardController struct {
	DB *gorm.DB
}

func NewDashboardController(db *gorm.DB) *DashboardController {
	return &DashboardController{DB: db}
}

// GetStats returns dashboard statistics (Admin only)
// GET /api/v1/admin/dashboard/stats
func (dc *DashboardController) GetStats(c *gin.Context) {
	// TODO: Implement dashboard stats
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Dashboard stats not implemented yet",
	})
}

// GetRecentRequests returns recent requests (Admin only)
// GET /api/v1/admin/dashboard/recent-requests
func (dc *DashboardController) GetRecentRequests(c *gin.Context) {
	// TODO: Implement recent requests
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Recent requests not implemented yet",
	})
}

// GetPopularProducts returns popular products (Admin only)
// GET /api/v1/admin/dashboard/popular-products
func (dc *DashboardController) GetPopularProducts(c *gin.Context) {
	// TODO: Implement popular products
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Popular products not implemented yet",
	})
}
