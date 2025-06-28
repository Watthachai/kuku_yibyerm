package middleware

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware returns a CORS middleware configured via environment variables.
func CORSMiddleware() gin.HandlerFunc {
	// อ่านค่า Frontend URL จาก Environment Variable
	// นี่เป็นวิธีที่ถูกต้องที่สุดสำหรับ Production
	frontendURL := os.Getenv("FRONTEND_URL")

	// ถ้าไม่ได้ตั้งค่า FRONTEND_URL ใน production ให้แสดง error ตอนเริ่มโปรแกรม
	// เพื่อให้รู้ตัวทันที ไม่ต้องรอจนเกิดปัญหาตอนใช้งานจริง
	if frontendURL == "" {
		log.Fatalf("FATAL: FRONTEND_URL environment variable is not set.")
	}

	config := cors.DefaultConfig()

	// อนุญาตเฉพาะ URL ของ Frontend ที่ระบุไว้ และ URL สำหรับพัฒนาระบบบน Localhost
	config.AllowOrigins = []string{
		"http://localhost:3000", // สำหรับ Next.js dev server
		frontendURL,             // สำหรับ Production
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

	// สำคัญมากเมื่อมีการส่ง Cookie หรือ Authorization header
	config.AllowCredentials = true

	log.Printf("CORS middleware initialized. Allowing origin: %s", frontendURL)

	return cors.New(config)
}
