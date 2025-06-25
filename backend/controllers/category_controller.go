// controllers/category_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Struct และ Constructor ที่ถูกต้อง (มีอยู่แล้ว)
type CategoryController struct {
	categoryService services.CategoryService
}

func NewCategoryController(categoryService services.CategoryService) *CategoryController {
	return &CategoryController{categoryService: categoryService}
}

// --- Method ทั้งหมดที่เรียกใช้ Service ---

// CreateCategory creates a new category.
func (ctrl *CategoryController) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}
	category, err := ctrl.categoryService.Create(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create category"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": category})
}

// GetCategories gets all categories.
func (ctrl *CategoryController) GetCategories(c *gin.Context) {
	categories, err := ctrl.categoryService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": categories})
}

// GetCategory gets a single category by its ID.
func (ctrl *CategoryController) GetCategory(c *gin.Context) {
	id := c.Param("id")
	category, err := ctrl.categoryService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Category not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": category})
}

// UpdateCategory updates an existing category.
func (ctrl *CategoryController) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}
	category, err := ctrl.categoryService.Update(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Category updated successfully", "data": category})
}

// DeleteCategory deletes a category.
func (ctrl *CategoryController) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.categoryService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Category deleted successfully"})
}
