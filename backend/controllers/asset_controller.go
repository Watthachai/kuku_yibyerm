// controllers/asset_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ⭐ แก้ไข Struct และ Constructor
type AssetController struct {
	assetService services.AssetService
}

func NewAssetController(assetService services.AssetService) *AssetController {
	return &AssetController{assetService: assetService}
}

// ⭐ แก้ไข Method ให้เรียกใช้ Service
func (ctrl *AssetController) CreateAsset(c *gin.Context) {
	var req dto.CreateAssetRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// Handle file from form
	image, _ := c.FormFile("image")
	req.Image = image

	asset, err := ctrl.assetService.CreateAsset(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create asset", "details": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": asset})
}
