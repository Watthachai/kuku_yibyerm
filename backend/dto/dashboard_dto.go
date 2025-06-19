// dto/dashboard_dto.go
package dto

// AdminStatsResponse holds the aggregated data for the admin dashboard.
type AdminStatsResponse struct {
	TotalUsers      int64 `json:"total_users"`
	TotalAssets     int64 `json:"total_assets"`
	TotalProducts   int64 `json:"total_products"`
	PendingRequests int64 `json:"pending_requests"`
}
