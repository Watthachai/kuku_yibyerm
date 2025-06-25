package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthController struct {
	DB *gorm.DB
}

func NewHealthController(db *gorm.DB) *HealthController {
	return &HealthController{DB: db}
}

// HealthCheck returns the service health status
// GET /health
func (hc *HealthController) HealthCheck(c *gin.Context) {
	// Check database connection
	sqlDB, err := hc.DB.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":   "unhealthy",
			"database": "disconnected",
			"error":    err.Error(),
		})
		return
	}

	if err := sqlDB.Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":   "unhealthy",
			"database": "unreachable",
			"error":    err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "healthy",
		"database": "connected",
		"service":  "ku-asset-api",
	})
}
