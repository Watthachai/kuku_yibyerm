package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"
	"strconv" // ⭐️ Import package นี้เข้ามา

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	productService services.ProductService
}

func NewProductController(productService services.ProductService) *ProductController {
	return &ProductController{productService: productService}
}

func (ctrl *ProductController) GetProducts(c *gin.Context) {
	// ... ฟังก์ชันนี้ไม่มีการรับ id จึงถูกต้องอยู่แล้ว ...
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

func (ctrl *ProductController) GetProduct(c *gin.Context) {
	idStr := c.Param("id")
	// ⭐ แปลง ID จาก string เป็น uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	product, err := ctrl.productService.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

func (ctrl *ProductController) CreateProduct(c *gin.Context) {
	// ... ฟังก์ชันนี้ไม่มีการรับ id จึงถูกต้องอยู่แล้ว ...
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}
	product, err := ctrl.productService.CreateProduct(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create product"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"success": true, "data": product})
}

func (ctrl *ProductController) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	// ⭐ แปลง ID จาก string เป็น uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid input"})
		return
	}

	product, err := ctrl.productService.UpdateProduct(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to update product"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": product})
}

func (ctrl *ProductController) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	// ⭐ แปลง ID จาก string เป็น uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid product ID"})
		return
	}

	if err := ctrl.productService.DeleteProduct(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete product"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Product deleted successfully"})
}
