package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter represents a rate limiter for specific endpoints
type RateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int           // max requests
	window   time.Duration // time window
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}

	// Cleanup old entries every minute
	go rl.cleanup()

	return rl
}

// Middleware returns a Gin middleware for rate limiting
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get client identifier (IP address or user ID)
		clientID := rl.getClientID(c)

		if !rl.isAllowed(clientID) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success":     false,
				"error":       "Rate limit exceeded. Please try again later.",
				"retry_after": int(rl.window.Seconds()),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// isAllowed checks if a request is allowed for the given client
func (rl *RateLimiter) isAllowed(clientID string) bool {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	now := time.Now()

	// Get existing requests for this client
	requests, exists := rl.requests[clientID]
	if !exists {
		requests = []time.Time{}
	}

	// Remove requests outside the time window
	validRequests := []time.Time{}
	for _, reqTime := range requests {
		if now.Sub(reqTime) <= rl.window {
			validRequests = append(validRequests, reqTime)
		}
	}

	// Check if we're within the limit
	if len(validRequests) >= rl.limit {
		return false
	}

	// Add current request
	validRequests = append(validRequests, now)
	rl.requests[clientID] = validRequests

	return true
}

// getClientID extracts client identifier from request
func (rl *RateLimiter) getClientID(c *gin.Context) string {
	// Try to get user ID from auth context first
	if userID, exists := c.Get("user_id"); exists {
		if uid, ok := userID.(string); ok {
			return "user:" + uid
		}
	}

	// Fall back to IP address
	return "ip:" + c.ClientIP()
}

// cleanup removes old entries from the rate limiter
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mutex.Lock()
		now := time.Now()

		for clientID, requests := range rl.requests {
			validRequests := []time.Time{}
			for _, reqTime := range requests {
				if now.Sub(reqTime) <= rl.window {
					validRequests = append(validRequests, reqTime)
				}
			}

			if len(validRequests) == 0 {
				delete(rl.requests, clientID)
			} else {
				rl.requests[clientID] = validRequests
			}
		}

		rl.mutex.Unlock()
	}
}

// Upload-specific rate limiters
var (
	// 10 uploads per minute per user
	UploadRateLimiter = NewRateLimiter(10, time.Minute)

	// 50 uploads per hour per user
	UploadHourlyLimiter = NewRateLimiter(50, time.Hour)
)
