package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS(allowedOrigins []string) gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{
		"Origin", "Content-Type", "Accept", "Authorization",
		"X-Requested-With", "Access-Control-Request-Method",
		"Access-Control-Request-Headers",
	}
	config.AllowCredentials = true

	return cors.New(config)
}
