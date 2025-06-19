// controllers/department_controller.go
package controllers

import (
	"ku-asset/dto"
	"ku-asset/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ⭐ 1. แก้ไข Struct และ Constructor ให้ถูกต้อง
type DepartmentController struct {
	departmentService services.DepartmentService
}

func NewDepartmentController(departmentService services.DepartmentService) *DepartmentController {
	return &DepartmentController{departmentService: departmentService}
}

// ⭐ 2. แก้ไข Method ทั้งหมดให้เรียกใช้ Service
func (ctrl *DepartmentController) GetDepartments(c *gin.Context) {
	var query dto.DepartmentQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	departments, err := ctrl.departmentService.GetDepartments(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve departments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": departments})
}

func (ctrl *DepartmentController) GetDepartment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	department, err := ctrl.departmentService.GetDepartmentByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": department})
}

func (ctrl *DepartmentController) GetFaculties(c *gin.Context) {
	faculties, err := ctrl.departmentService.GetFaculties()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve faculties"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": faculties})
}
