package services

import (
	"ku-asset/dto"
	"ku-asset/models"

	"log"

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
	var (
		totalUsers, totalProducts, totalDepartments                            int64
		pendingRequests, approvedRequests, rejectedRequests, completedRequests int64
		monthlyRequests, activeUsers, lowStockProducts                         int64
	)

	// ⭐ Debug: ตรวจสอบข้อมูลในฐานข้อมูล
	log.Println("🔍 Starting GetAdminStats...")

	// Basic counts
	if err := s.db.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		log.Printf("❌ Error counting users: %v", err)
		return nil, err
	}
	log.Printf("✅ Total users: %d", totalUsers)

	if err := s.db.Model(&models.Product{}).Count(&totalProducts).Error; err != nil {
		log.Printf("❌ Error counting products: %v", err)
		return nil, err
	}
	log.Printf("✅ Total products: %d", totalProducts)

	if err := s.db.Model(&models.Department{}).Count(&totalDepartments).Error; err != nil {
		log.Printf("❌ Error counting departments: %v", err)
		return nil, err
	}
	log.Printf("✅ Total departments: %d", totalDepartments)

	// ⭐ Debug: ตรวจสอบ Request counts แยกแต่ละ status
	log.Printf("🔍 Checking request statuses... Available constants:")
	log.Printf("  - RequestStatusPending: '%s'", models.RequestStatusPending)
	log.Printf("  - RequestStatusApproved: '%s'", models.RequestStatusApproved)
	log.Printf("  - RequestStatusRejected: '%s'", models.RequestStatusRejected)

	// Debug: ดูข้อมูลใน requests table ทั้งหมด
	var allRequests []models.Request
	if err := s.db.Find(&allRequests).Error; err != nil {
		log.Printf("❌ Error getting all requests: %v", err)
	} else {
		log.Printf("🔍 Found %d total requests:", len(allRequests))
		for i, req := range allRequests {
			log.Printf("  [%d] ID: %d, Status: '%s', Purpose: '%s'", i+1, req.ID, req.Status, req.Purpose)
		}
	}

	// Request status counts
	if err := s.db.Model(&models.Request{}).
		Where("status = ?", models.RequestStatusPending).Count(&pendingRequests).Error; err != nil {
		log.Printf("❌ Error counting pending requests: %v", err)
		return nil, err
	}
	log.Printf("✅ Pending requests: %d", pendingRequests)

	if err := s.db.Model(&models.Request{}).
		Where("status = ?", models.RequestStatusApproved).Count(&approvedRequests).Error; err != nil {
		log.Printf("❌ Error counting approved requests: %v", err)
		return nil, err
	}
	log.Printf("✅ Approved requests: %d", approvedRequests)

	if err := s.db.Model(&models.Request{}).
		Where("status = ?", models.RequestStatusRejected).Count(&rejectedRequests).Error; err != nil {
		log.Printf("❌ Error counting rejected requests: %v", err)
		return nil, err
	}
	log.Printf("✅ Rejected requests: %d", rejectedRequests)

	// Monthly requests (this month)
	if err := s.db.Model(&models.Request{}).
		Where("created_at >= date_trunc('month', current_date)").Count(&monthlyRequests).Error; err != nil {
		log.Printf("❌ Error counting monthly requests: %v", err)
		return nil, err
	}
	log.Printf("✅ Monthly requests: %d", monthlyRequests)

	// Active users (logged in last 30 days)
	if err := s.db.Model(&models.User{}).
		Where("last_login_at >= current_date - interval '30 days'").Count(&activeUsers).Error; err != nil {
		log.Printf("❌ Error counting active users: %v", err)
		// ไม่ return error เพราะ last_login_at อาจจะยังไม่มี
	}
	log.Printf("✅ Active users: %d", activeUsers)

	// Low stock products (stock <= 5) ⭐ ใช้ stock แทน quantity
	if err := s.db.Model(&models.Product{}).
		Where("stock <= ?", 5).Count(&lowStockProducts).Error; err != nil {
		log.Printf("❌ Error counting low stock products: %v", err)
		return nil, err
	}
	log.Printf("✅ Low stock products: %d", lowStockProducts)

	result := &dto.AdminStatsResponse{
		TotalUsers:        totalUsers,
		TotalProducts:     totalProducts,
		TotalDepartments:  totalDepartments,
		PendingRequests:   pendingRequests,
		ApprovedRequests:  approvedRequests,
		RejectedRequests:  rejectedRequests,
		CompletedRequests: completedRequests,
		MonthlyRequests:   monthlyRequests,
		ActiveUsers:       activeUsers,
		LowStockProducts:  lowStockProducts,
	}

	log.Printf("🎯 Final result: %+v", result)
	return result, nil
}

func (s *dashboardService) GetRecentActivity(limit int) ([]dto.RecentActivityResponse, error) {
	var recentRequests []models.Request
	err := s.db.Preload("User").Order("created_at desc").Limit(limit).Find(&recentRequests).Error
	if err != nil {
		return nil, err
	}

	activities := make([]dto.RecentActivityResponse, 0)

	for _, req := range recentRequests {
		activities = append(activities, dto.RecentActivityResponse{
			ID:      req.ID,
			Type:    "REQUEST",
			Message: "สร้างคำขอเบิก: " + req.Purpose,
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
	requestsByMonth := make([]dto.MonthCount, 0)
	s.db.Model(&models.Request{}).
		Select("to_char(created_at, 'YYYY-MM') as month, count(*) as count").
		Group("month").
		Order("month asc").
		Limit(12). // ⭐ เพิ่ม limit 12 เดือน
		Find(&requestsByMonth)

	topRequestedItems := make([]dto.ProductCount, 0)
	s.db.Model(&models.RequestItem{}).
		Select("products.name, COUNT(request_items.id) as count").
		Joins("left join products on products.id = request_items.product_id").
		Group("products.name").
		Order("count desc").
		Limit(10). // ⭐ เพิ่มเป็น 10 รายการ
		Find(&topRequestedItems)

	departmentUsage := make([]dto.DeptCount, 0)
	s.db.Model(&models.Request{}).
		Select("departments.name_th as department, COUNT(requests.id) as count").
		Joins("left join users on users.id = requests.user_id").
		Joins("left join departments on departments.id = users.department_id").
		Where("departments.name_th IS NOT NULL").
		Group("departments.name_th").
		Order("count desc").
		Limit(8). // ⭐ เพิ่มหน่วยงาน
		Find(&departmentUsage)

	// ⭐ เพิ่ม Request breakdown by status
	requestsByStatus := make([]dto.StatusCount, 0)
	s.db.Model(&models.Request{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&requestsByStatus)

	return &dto.SystemStatsResponse{
		RequestsByMonth:   requestsByMonth,
		TopRequestedItems: topRequestedItems,
		DepartmentUsage:   departmentUsage,
		RequestsByStatus:  requestsByStatus,
	}, nil
}
