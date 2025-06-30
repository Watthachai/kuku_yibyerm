package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// PanicRecoveryMiddleware catches any panic, logs the stack trace,
// and returns a generic error message. This helps to debug hidden panics.
func PanicRecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// เพิ่ม Log สำหรับการทดสอบ
		log.Printf("--> PanicRecoveryMiddleware is ACTIVE for request: %s", c.Request.URL.Path)

		defer func() {
			if err := recover(); err != nil {
				// A panic occurred. Log the error and stack trace.
				log.Printf("‼️‼️‼️ A PANIC HAS OCCURRED ‼️‼️‼️")
				log.Printf("Panic error: %v", err)
				log.Printf("Stack trace: \n%s", string(debug.Stack())) // Adding a newline for readability

				// Respond with a generic 500 error.
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "An internal server error occurred. The incident has been logged.",
				})
				// Abort the context to prevent other handlers from running.
				c.Abort()
			}
		}()
		// Continue to the next handler if no panic.
		c.Next()
	}
}
