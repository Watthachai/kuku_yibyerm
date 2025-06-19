// dto/department_dto.go
package dto

type DepartmentResponse struct {
	ID     uint   `json:"id"`
	Code   string `json:"code"`
	NameTH string `json:"name_th"`
	NameEN string `json:"name_en"`
	Type   string `json:"type"`
}

type DepartmentQuery struct {
	Type    string `form:"type"`
	Include string `form:"include"`
}
