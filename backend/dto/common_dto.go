// dto/common_dto.go
package dto

// PaginationResponse holds pagination metadata.
type PaginationResponse struct {
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
	Total       int64 `json:"total"`
	TotalPages  int64 `json:"total_pages"`
}
