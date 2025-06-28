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

	// --- ทำให้โค้ดทนทานและ Debug ง่ายขึ้น ---

	// 1. สร้างลิสต์ของ Origin ที่จะอนุญาต
	var allowedOrigins []string

	// 2. อนุญาต Localhost สำหรับการพัฒนาเสมอ
	allowedOrigins = append(allowedOrigins, "http://localhost:3000")

	// 3. อ่านค่า FRONTEND_URL จาก Environment Variable
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL != "" {
		// ถ้าเจอ ให้เพิ่มเข้าไปในลิสต์
		log.Printf("✅ Found FRONTEND_URL environment variable: %s", frontendURL)
		allowedOrigins = append(allowedOrigins, frontendURL)
	} else {
		// ถ้าไม่เจอ ให้แสดงคำเตือนใน Log
		log.Println("⚠️ WARNING: FRONTEND_URL environment variable is not set or is empty.")
	}

	// 4. เพิ่ม URL ที่ Hardcode ไว้อีกชั้นเพื่อความปลอดภัย
	// เผื่อกรณีการตั้งค่าผิดพลาดหรือปัญหาตอน Deploy
	hardcodedURL := "https://kukuyibyerm-production.up.railway.app"
	log.Printf("ℹ️ Adding hardcoded fallback origin for safety: %s", hardcodedURL)
	allowedOrigins = append(allowedOrigins, hardcodedURL)

	config.AllowOrigins = allowedOrigins

	// Log ลิสต์ของ Origin ทั้งหมดที่อนุญาตสุดท้าย
	log.Printf("➡️ Final list of allowed origins for CORS: %v", config.AllowOrigins)

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
