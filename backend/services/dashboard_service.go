// services/dashboard_service.go
package services

import (
	"ku-asset/dto"
	"ku-asset/models"

	"gorm.io/gorm"
)

type DashboardService interface {
	GetAdminStats() (*dto.AdminStatsResponse, error)
}

type dashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{db: db}
}

func (s *dashboardService) GetAdminStats() (*dto.AdminStatsResponse, error) {
	var totalUsers int64
	if err := s.db.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		return nil, err
	}

	var totalAssets int64
	if err := s.db.Model(&models.Asset{}).Count(&totalAssets).Error; err != nil {
		return nil, err
	}

	// เพิ่มการนับอื่นๆ ตามต้องการ

	stats := &dto.AdminStatsResponse{
		TotalUsers:  totalUsers,
		TotalAssets: totalAssets,
		// ...
	}

	return stats, nil
}
