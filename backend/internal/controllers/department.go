package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"kuku-yipyerm/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DepartmentController handles department-related requests
type DepartmentController struct {
	DB *gorm.DB
}

// NewDepartmentController creates a new DepartmentController
func NewDepartmentController(db *gorm.DB) *DepartmentController {
	return &DepartmentController{DB: db}
}

// GetDepartments retrieves all departments with optional filtering
func (dc *DepartmentController) GetDepartments(c *gin.Context) {
	var departments []models.Department
	query := dc.DB.Where("is_active = ?", true)

	// Filter by type if provided
	if departmentType := c.Query("type"); departmentType != "" {
		query = query.Where("type = ?", strings.ToUpper(departmentType))
	}

	// Include parent/children if requested
	if c.Query("include") == "hierarchy" {
		query = query.Preload("Parent").Preload("Children")
	}

	if err := query.Order("name_th ASC").Find(&departments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve departments",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": departments,
	})
}

// GetDepartment retrieves a specific department by ID
func (dc *DepartmentController) GetDepartment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid department ID",
		})
		return
	}

	var department models.Department
	if err := dc.DB.Preload("Parent").Preload("Children").
		First(&department, uint(id)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Department not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve department",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": department,
	})
}

// GetFaculties retrieves only faculty-type departments
func (dc *DepartmentController) GetFaculties(c *gin.Context) {
	var faculties []models.Department
	if err := dc.DB.Where("type = ? AND is_active = ?", models.DepartmentTypeFaculty, true).
		Order("name_th ASC").Find(&faculties).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve faculties",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": faculties,
	})
}
