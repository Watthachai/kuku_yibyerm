// dto/dashboard_dto.go
package dto

import "time"

// ⭐ อัปเดต AdminStatsResponse ให้ตรงกับระบบจริง
type AdminStatsResponse struct {
	TotalUsers        int64 `json:"total_users"`        // จำนวนผู้ใช้ทั้งหมด
	TotalProducts     int64 `json:"total_products"`     // จำนวนครุภัณฑ์ในระบบ
	TotalDepartments  int64 `json:"total_departments"`  // จำนวนหน่วยงาน
	PendingRequests   int64 `json:"pending_requests"`   // คำขอรออนุมัติ
	ApprovedRequests  int64 `json:"approved_requests"`  // คำขอที่อนุมัติแล้ว
	RejectedRequests  int64 `json:"rejected_requests"`  // คำขอที่ปฏิเสธ
	CompletedRequests int64 `json:"completed_requests"` // คำขอที่เสร็จสิ้น
	MonthlyRequests   int64 `json:"monthly_requests"`   // คำขอเดือนนี้
	ActiveUsers       int64 `json:"active_users"`       // ผู้ใช้ที่ใช้งานล่าสุด
	LowStockProducts  int64 `json:"low_stock_products"` // ครุภัณฑ์ที่เหลือน้อย
}

// เหมือนเดิม
type ActivityUserResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type RecentActivityResponse struct {
	ID        uint                 `json:"id"`
	Type      string               `json:"type"`
	Message   string               `json:"message"`
	User      ActivityUserResponse `json:"user"`
	Timestamp time.Time            `json:"timestamp"`
}

type SystemStatsResponse struct {
	RequestsByMonth   []MonthCount   `json:"requestsByMonth"`
	TopRequestedItems []ProductCount `json:"topRequestedItems"`
	DepartmentUsage   []DeptCount    `json:"departmentUsage"`
	RequestsByStatus  []StatusCount  `json:"requestsByStatus"` // ⭐ เพิ่มใหม่
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

// ⭐ เพิ่มสำหรับ Status breakdown
type StatusCount struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}
