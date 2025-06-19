package services

import (
	"ku-asset/dto"
	"ku-asset/models"

	"gorm.io/gorm"
)

type DashboardService interface {
	GetAdminStats() (*dto.AdminStatsResponse, error)
	GetRecentActivity(limit int) ([]dto.RecentActivityResponse, error)
	GetSystemStats() (*dto.SystemStatsResponse, error)
}
type dashboardService struct{ db *gorm.DB }

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{db: db}
}

func (s *dashboardService) GetAdminStats() (*dto.AdminStatsResponse, error) {
	var totalUsers, totalAssets, totalProducts, pendingRequests int64
	errChan := make(chan error, 4)
	go func() { errChan <- s.db.Model(&models.User{}).Count(&totalUsers).Error }()
	go func() { errChan <- s.db.Model(&models.Asset{}).Count(&totalAssets).Error }()
	go func() { errChan <- s.db.Model(&models.Product{}).Count(&totalProducts).Error }()
	go func() {
		errChan <- s.db.Model(&models.Request{}).Where("status = ?", models.RequestStatusPending).Count(&pendingRequests).Error
	}()
	for i := 0; i < 4; i++ {
		if err := <-errChan; err != nil {
			return nil, err
		}
	}
	return &dto.AdminStatsResponse{
		TotalUsers:      totalUsers,
		TotalAssets:     totalAssets,
		TotalProducts:   totalProducts,
		PendingRequests: pendingRequests,
	}, nil
}

// ⭐ แก้ไขส่วนนี้ให้ถูกต้อง
func (s *dashboardService) GetRecentActivity(limit int) ([]dto.RecentActivityResponse, error) {
	var recentRequests []models.Request
	err := s.db.Preload("User").Order("created_at desc").Limit(limit).Find(&recentRequests).Error
	if err != nil {
		return nil, err
	}

	activities := make([]dto.RecentActivityResponse, 0)

	for _, req := range recentRequests {
		// แก้ไขการสร้าง object ให้ตรงกับ DTO
		activities = append(activities, dto.RecentActivityResponse{
			ID:      req.ID,
			Type:    "REQUEST",
			Message: "สร้างคำขอเบิก: " + req.Purpose,
			// สร้าง User object ที่ซ้อนกัน
			User: dto.ActivityUserResponse{
				ID:   req.User.ID,
				Name: req.User.Name,
			},
			Timestamp: req.CreatedAt,
		})
	}
	return activities, nil
}

func (s *dashboardService) GetSystemStats() (*dto.SystemStatsResponse, error) {
	// ⭐️ เปลี่ยนจากการประกาศ var ธรรมดา
	// var requestsByMonth []dto.MonthCount

	// ⭐️ มาเป็นการใช้ make() เพื่อให้ได้ slice ว่างๆ ที่ไม่ใช่ nil
	requestsByMonth := make([]dto.MonthCount, 0)
	s.db.Model(&models.Request{}).
		Select("to_char(created_at, 'YYYY-MM') as month, count(*) as count").
		Group("month").
		Order("month asc").
		Find(&requestsByMonth)

	topRequestedItems := make([]dto.ProductCount, 0) // ⭐️ ใช้ make()
	s.db.Model(&models.RequestItem{}).
		Select("products.name, COUNT(request_items.id) as count").
		Joins("left join products on products.id = request_items.product_id").
		Group("products.name").
		Order("count desc").
		Limit(5).
		Find(&topRequestedItems)

	departmentUsage := make([]dto.DeptCount, 0) // ⭐️ ใช้ make()
	s.db.Model(&models.Request{}).
		Select("departments.name_th as department, COUNT(requests.id) as count").
		Joins("left join users on users.id = requests.user_id").
		Joins("left join departments on departments.id = users.department_id").
		Where("departments.name_th IS NOT NULL").
		Group("departments.name_th").
		Order("count desc").
		Limit(5).
		Find(&departmentUsage)

	return &dto.SystemStatsResponse{
		RequestsByMonth:   requestsByMonth,
		TopRequestedItems: topRequestedItems,
		DepartmentUsage:   departmentUsage,
	}, nil
}
