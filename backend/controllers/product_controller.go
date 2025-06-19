// controllers/product_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	productService services.ProductService
}

func NewProductController(productService services.ProductService) *ProductController {
	return &ProductController{productService: productService}
}

func (ctrl *ProductController) GetProducts(c *gin.Context) {
	var query dto.ProductQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	paginatedResult, err := ctrl.productService.GetProducts(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get products"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": paginatedResult})
}

// ⭐ เติม Logic ให้ GetProduct
func (ctrl *ProductController) GetProduct(c *gin.Context) {
	id := c.Param("id")
	product, err := ctrl.productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// ⭐ เติม Logic ให้ CreateProduct
func (ctrl *ProductController) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input", "details": err.Error()})
		return
	}
	product, err := ctrl.productService.CreateProduct(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create product", "details": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": product})
}

// ⭐ เติม Logic ให้ UpdateProduct
func (ctrl *ProductController) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input", "details": err.Error()})
		return
	}
	product, err := ctrl.productService.UpdateProduct(id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update product", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

// ⭐ เติม Logic ให้ DeleteProduct
func (ctrl *ProductController) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.productService.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete product", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product deleted successfully"})
}
