// dto/auth_dto.go

package dto

// LoginRequest defines the structure for a login request.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest defines the structure for a user registration request.
type RegisterRequest struct {
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=6"`
	Name         string `json:"name" binding:"required"`
	DepartmentID uint   `json:"department_id"` // รับเป็น uint ตรงๆ เลย
}

// AuthResponse defines the successful authentication response.
type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
}

// UserResponse defines the user data sent back to the client.
type UserResponse struct {
	ID           uint    `json:"id"`
	Email        string  `json:"email"`
	Name         string  `json:"name"`
	Role         string  `json:"role"`
	DepartmentID *uint   `json:"department_id"`
	Avatar       *string `json:"avatar"`
}

// RefreshTokenRequest defines the structure for a token refresh request.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// GoogleOAuthRequest defines the structure for google oauth callback.
type GoogleOAuthRequest struct {
	Email      string  `json:"email" binding:"required,email"`
	Name       string  `json:"name" binding:"required"`
	Avatar     *string `json:"avatar,omitempty"`
	ProviderID string  `json:"providerId"`
	Code       string  `json:"code"`
	State      string  `json:"state"`
}

// AccessTokenResponse defines the response for a new access token.
type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}
