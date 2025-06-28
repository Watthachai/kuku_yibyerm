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

	// -----------------------------------------------------------------
	// ‼️ DEBUGGING STEP: TEMPORARILY ALLOW ALL ORIGINS ‼️
	// เรากำลังทดสอบว่าปัญหาอยู่ที่การนำ middleware ไปใช้หรือไม่
	// ถ้าวิธีนี้แก้ปัญหาได้ แสดงว่าคุณต้องไปแก้ที่การตั้งค่า Gin Router
	// และต้องลบบรรทัดนี้ออกใน Production เพื่อความปลอดภัย
	config.AllowAllOrigins = true
	log.Println("‼️ WARNING: CORS is temporarily set to allow all origins for debugging purposes.")
	// -----------------------------------------------------------------

	// โค้ดเดิมยังคงอยู่เพื่อให้เห็นว่าปกติควรทำอย่างไร
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		log.Printf("✅ Found FRONTEND_URL environment variable: %s", frontendURL)
		// ปกติเราจะใช้บรรทัดนี้ แต่ตอนนี้เราใช้ AllowAllOrigins แทน
		// config.AllowOrigins = []string{"http://localhost:3000", frontendURL}
	} else {
		log.Println("⚠️ WARNING: FRONTEND_URL environment variable is not set or is empty.")
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
