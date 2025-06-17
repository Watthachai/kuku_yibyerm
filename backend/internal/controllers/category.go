package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryController struct {
	DB *gorm.DB
}

func NewCategoryController(db *gorm.DB) *CategoryController {
	return &CategoryController{DB: db}
}

// CreateCategory creates a new category (Admin only)
// POST /api/v1/admin/categories
func (cc *CategoryController) CreateCategory(c *gin.Context) {
	// TODO: Implement category creation
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Category creation not implemented yet",
	})
}

// UpdateCategory updates a category (Admin only)
// PUT /api/v1/admin/categories/:id
func (cc *CategoryController) UpdateCategory(c *gin.Context) {
	// TODO: Implement category update
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Category update not implemented yet",
	})
}

// DeleteCategory deletes a category (Admin only)
// DELETE /api/v1/admin/categories/:id
func (cc *CategoryController) DeleteCategory(c *gin.Context) {
	// TODO: Implement category deletion
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Category deletion not implemented yet",
	})
}
