package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReportController struct {
	DB *gorm.DB
}

func NewReportController(db *gorm.DB) *ReportController {
	return &ReportController{DB: db}
}

// GetRequestsReport returns requests report (Admin only)
// GET /api/v1/admin/reports/requests
func (rc *ReportController) GetRequestsReport(c *gin.Context) {
	// TODO: Implement requests report
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Requests report not implemented yet",
	})
}

// GetProductsReport returns products report (Admin only)
// GET /api/v1/admin/reports/products
func (rc *ReportController) GetProductsReport(c *gin.Context) {
	// TODO: Implement products report
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Products report not implemented yet",
	})
}

// GetUsageReport returns usage report (Admin only)
// GET /api/v1/admin/reports/usage
func (rc *ReportController) GetUsageReport(c *gin.Context) {
	// TODO: Implement usage report
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Usage report not implemented yet",
	})
}

// ExportRequestsReport exports requests report (Admin only)
// GET /api/v1/admin/reports/export/requests
func (rc *ReportController) ExportRequestsReport(c *gin.Context) {
	// TODO: Implement requests report export
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Requests report export not implemented yet",
	})
}
