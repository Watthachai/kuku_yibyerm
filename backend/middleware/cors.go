package middleware

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// TODO: ใช้ ENV หรือ config แทน hardcode URL
// ⭐ ควรใช้ ENV หรือ config แทน hardcode URL เพื่อความยื
// CORSMiddleware returns a CORS middleware with appropriate configuration
func CORSMiddleware() gin.HandlerFunc {
	config := cors.DefaultConfig()

	// ⭐ Get environment variables with fallbacks
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "https://kukuyibyerm-production.up.railway.app"
	}

	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
		frontendURL,
		"https://kukuyibyerm-production.up.railway.app",      // ⭐ Hardcoded fallback
		"https://kuku-yipyerm-app-production.up.railway.app", // ⭐ Alternative
	}

	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Accept",
		"Authorization",
		"Cache-Control",
	}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true

	return cors.New(config)
}
