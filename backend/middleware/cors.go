package middleware

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware returns a CORS middleware configured via environment variables.
func CORSMiddleware() gin.HandlerFunc {
	config := cors.DefaultConfig()

	// Configure allowed origins
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		log.Printf("✅ Found FRONTEND_URL environment variable: %s", frontendURL)
		config.AllowOrigins = []string{"http://localhost:3000", frontendURL}
	} else {
		log.Println("⚠️ WARNING: FRONTEND_URL environment variable is not set or is empty.")
		config.AllowOrigins = []string{
			"http://localhost:3000",                         // Development
			"https://kukuyibyerm-production.up.railway.app", // Production
		}
	}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}

	return cors.New(config)
}
