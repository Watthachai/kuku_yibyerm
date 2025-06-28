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
	config.AllowOrigins = []string{
		os.Getenv("FRONTEND_URL"),             // ⭐ ใช้ Environment Variable
		os.Getenv("ALTERNATIVE_FRONTEND_URL"), // ⭐ Alternative Frontend URL
		os.Getenv("BACKEND_URL"),              // ⭐ Backend URL
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
