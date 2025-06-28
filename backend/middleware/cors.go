package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// TODO: ใช้ ENV หรือ config แทน hardcode URL
// ⭐ ควรใช้ ENV หรือ config แทน hardcode URL เพื่อความยื
// CORSMiddleware returns a CORS middleware with appropriate configuration
func CORSMiddleware() gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"https://kukuyibyerm-production.up.railway.app",      // ⭐ Frontend URL
		"https://kuku-yipyerm-app-production.up.railway.app", // ⭐ Alternative frontend URL
		"https://backend-go-production-2ba8.up.railway.app",  // ⭐ Backend URL (for internal calls)
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
