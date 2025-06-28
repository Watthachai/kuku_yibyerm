package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware (DEBUG VERSION)
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("--- ENTER AdminMiddleware (DEBUG) ---")

		// Since debug AuthMiddleware doesn't set context, this will always fail.
		// This is the expected behavior for this test.
		_, exists := c.Get("userRole")
		if !exists {
			log.Println("DEBUG: userRole not found in context (as expected with debug AuthMiddleware).")
			log.Println("DEBUG: This confirms we have successfully bypassed the panic in AuthMiddleware!")
			// We send a clear error instead of letting it panic.
			c.JSON(http.StatusForbidden, gin.H{"error": "DEBUG: Bypassed auth, access denied here."})
			c.Abort()
			return
		}

		log.Println("--- EXIT AdminMiddleware (This part should not be reached) ---")
		c.Next()
	}
}
