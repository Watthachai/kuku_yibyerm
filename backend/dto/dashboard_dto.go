// dto/dashboard_dto.go
package dto

import "time"

type AdminStatsResponse struct {
	TotalUsers      int64 `json:"total_users"`
	TotalAssets     int64 `json:"total_assets"`
	TotalProducts   int64 `json:"total_products"`
	PendingRequests int64 `json:"pending_requests"`
}

type StatusCount struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

// ⭐ สร้าง Struct สำหรับ user ที่จะซ้อนเข้าไป
type ActivityUserResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// ⭐ แก้ไข RecentActivityResponse ให้มี User object ซ้อนอยู่
type RecentActivityResponse struct {
	ID        uint                 `json:"id"`
	Type      string               `json:"type"`
	Message   string               `json:"message"`
	User      ActivityUserResponse `json:"user"` // 👈 เปลี่ยนจาก UserName เป็น User object
	Timestamp time.Time            `json:"timestamp"`
}

type SystemStatsResponse struct {
	RequestsByMonth   []MonthCount   `json:"requestsByMonth"`
	TopRequestedItems []ProductCount `json:"topRequestedItems"`
	DepartmentUsage   []DeptCount    `json:"departmentUsage"`
}

type MonthCount struct {
	Month string `json:"month"`
	Count int    `json:"count"`
}

type ProductCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type DeptCount struct {
	Department string `json:"department"`
	Count      int    `json:"count"`
}
