package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware returns a CORS middleware with appropriate configuration
func CORSMiddleware() gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"https://*.up.railway.app",                      // ⭐ Allow all Railway domains
		"https://kukuyibyerm-production.up.railway.app", // ⭐ Alternative domain pattern
	}
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
