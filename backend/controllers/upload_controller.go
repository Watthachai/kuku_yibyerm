package controllers

import (
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UploadController struct {
	uploadService *services.UploadService
}

func NewUploadController() *UploadController {
	return &UploadController{
		uploadService: services.NewUploadService(),
	}
}

// UploadProductImage อัปโหลดรูปภาพสำหรับสินค้า
func (uc *UploadController) UploadProductImage(c *gin.Context) {
	// ตรวจสอบไฟล์
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "No image file provided",
		})
		return
	}
	defer file.Close()

	// Get upload configuration
	config := uc.uploadService.GetProductImageConfig()

	// Validate file
	if err := uc.uploadService.ValidateFile(header, config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Process and save image
	result, err := uc.uploadService.ProcessAndSaveImage(file, header, config)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to process image: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// DeleteProductImage ลบรูปภาพสินค้า
func (uc *UploadController) DeleteProductImage(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Filename required",
		})
		return
	}

	// Delete file using upload service
	config := uc.uploadService.GetProductImageConfig()
	if err := uc.uploadService.DeleteFile(filename, config.UploadDir); err != nil {
		if err.Error() == "file not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "File not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File deleted successfully",
	})
}
