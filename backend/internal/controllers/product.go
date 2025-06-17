package controllers

import (
	"net/http"
	"strconv"

	"ku-asset/internal/services"

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	productService *services.ProductService
}

func NewProductController(productService *services.ProductService) *ProductController {
	return &ProductController{
		productService: productService,
	}
}

// GetProducts returns all products with filters
func (pc *ProductController) GetProducts(c *gin.Context) {
	// Parse query parameters
	categoryID := c.Query("category_id")
	search := c.Query("search")
	status := c.Query("status")
	departmentID := c.Query("department_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	products, total, err := pc.productService.GetProducts(services.ProductFilter{
		CategoryID:   categoryID,
		Search:       search,
		Status:       status,
		DepartmentID: departmentID,
		Page:         page,
		Limit:        limit,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get products",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// GetProduct returns a single product by ID
func (pc *ProductController) GetProduct(c *gin.Context) {
	id := c.Param("id")

	product, err := pc.productService.GetProductByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Product not found",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"product": product,
	})
}

// GetCategories returns all categories
func (pc *ProductController) GetCategories(c *gin.Context) {
	categories, err := pc.productService.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get categories",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
	})
}

// CreateProduct creates a new product (Admin only)
// POST /api/v1/admin/products
func (pc *ProductController) CreateProduct(c *gin.Context) {
	// TODO: Implement product creation
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Product creation not implemented yet",
	})
}

// UpdateProduct updates a product (Admin only)
// PUT /api/v1/admin/products/:id
func (pc *ProductController) UpdateProduct(c *gin.Context) {
	// TODO: Implement product update
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Product update not implemented yet",
	})
}

// DeleteProduct deletes a product (Admin only)
// DELETE /api/v1/admin/products/:id
func (pc *ProductController) DeleteProduct(c *gin.Context) {
	// TODO: Implement product deletion
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Product deletion not implemented yet",
	})
}

// ActivateProduct activates a product (Admin only)
// PUT /api/v1/admin/products/:id/activate
func (pc *ProductController) ActivateProduct(c *gin.Context) {
	// TODO: Implement product activation
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Product activation not implemented yet",
	})
}

// DeactivateProduct deactivates a product (Admin only)
// PUT /api/v1/admin/products/:id/deactivate
func (pc *ProductController) DeactivateProduct(c *gin.Context) {
	// TODO: Implement product deactivation
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Product deactivation not implemented yet",
	})
}
