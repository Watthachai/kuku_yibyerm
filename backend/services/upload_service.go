package services

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/image/draw"
)

type UploadService struct{}

type UploadConfig struct {
	MaxFileSize      int64           // in bytes
	AllowedTypes     map[string]bool // file extensions
	AllowedMimeTypes map[string]bool // MIME types
	MaxWidth         int             // max image width
	MaxHeight        int             // max image height
	Quality          int             // JPEG quality (1-100)
	UploadDir        string          // upload directory
	BaseURL          string          // base URL for file access
}

type UploadResult struct {
	URL          string `json:"url"`
	Filename     string `json:"filename"`
	Size         int64  `json:"size"`
	OriginalName string `json:"original_name"`
	MimeType     string `json:"mime_type"`
	Width        int    `json:"width,omitempty"`
	Height       int    `json:"height,omitempty"`
}

func NewUploadService() *UploadService {
	return &UploadService{}
}

// GetProductImageConfig returns configuration for product image uploads
func (us *UploadService) GetProductImageConfig() *UploadConfig {
	return &UploadConfig{
		MaxFileSize: 5 * 1024 * 1024, // 5MB
		AllowedTypes: map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".webp": true,
		},
		AllowedMimeTypes: map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/webp": true,
		},
		MaxWidth:  1920,
		MaxHeight: 1080,
		Quality:   85,
		UploadDir: "uploads/products",
		BaseURL:   os.Getenv("BASE_URL"),
	}
}

// ValidateFile validates uploaded file against configuration
func (us *UploadService) ValidateFile(header *multipart.FileHeader, config *UploadConfig) error {
	// Check file size
	if header.Size > config.MaxFileSize {
		return fmt.Errorf("file size %d bytes exceeds maximum allowed size %d bytes", header.Size, config.MaxFileSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !config.AllowedTypes[ext] {
		return fmt.Errorf("file type %s not allowed", ext)
	}

	// Check MIME type
	if len(config.AllowedMimeTypes) > 0 {
		// This would need additional MIME type detection in a real implementation
		// For now, we'll rely on file extension
	}

	// Check filename for security
	if strings.Contains(header.Filename, "..") || strings.Contains(header.Filename, "/") || strings.Contains(header.Filename, "\\") {
		return errors.New("invalid filename")
	}

	return nil
}

// ProcessAndSaveImage processes and saves an uploaded image
func (us *UploadService) ProcessAndSaveImage(file multipart.File, header *multipart.FileHeader, config *UploadConfig) (*UploadResult, error) {
	// Create upload directory
	if err := os.MkdirAll(config.UploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Decode image
	img, format, err := image.Decode(bytes.NewReader(fileBytes))
	if err != nil {
		return nil, fmt.Errorf("invalid image format: %w", err)
	}

	// Get original dimensions
	bounds := img.Bounds()
	originalWidth := bounds.Dx()
	originalHeight := bounds.Dy()

	// Resize if necessary
	if originalWidth > config.MaxWidth || originalHeight > config.MaxHeight {
		img = us.resizeImage(img, config.MaxWidth, config.MaxHeight)
	}

	// Generate filename
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" {
		ext = "." + format
	}

	filename := fmt.Sprintf("product_%s_%d%s",
		uuid.New().String()[:8],
		time.Now().Unix(),
		ext)

	filePath := filepath.Join(config.UploadDir, filename)

	// Save processed image
	if err := us.saveImage(img, filePath, format, config.Quality); err != nil {
		return nil, fmt.Errorf("failed to save image: %w", err)
	}

	// Get file info
	stat, err := os.Stat(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get file stats: %w", err)
	}

	// Create URL
	baseURL := config.BaseURL
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	imageURL := fmt.Sprintf("%s/%s/%s", baseURL, config.UploadDir, filename)

	// Get final dimensions
	finalBounds := img.Bounds()

	return &UploadResult{
		URL:          imageURL,
		Filename:     filename,
		Size:         stat.Size(),
		OriginalName: header.Filename,
		MimeType:     "image/" + format,
		Width:        finalBounds.Dx(),
		Height:       finalBounds.Dy(),
	}, nil
}

// resizeImage resizes an image while maintaining aspect ratio
func (us *UploadService) resizeImage(src image.Image, maxWidth, maxHeight int) image.Image {
	bounds := src.Bounds()
	srcWidth := bounds.Dx()
	srcHeight := bounds.Dy()

	// Calculate new dimensions maintaining aspect ratio
	ratio := float64(srcWidth) / float64(srcHeight)

	var newWidth, newHeight int
	if ratio > 1 { // landscape
		newWidth = maxWidth
		newHeight = int(float64(maxWidth) / ratio)
		if newHeight > maxHeight {
			newHeight = maxHeight
			newWidth = int(float64(maxHeight) * ratio)
		}
	} else { // portrait or square
		newHeight = maxHeight
		newWidth = int(float64(maxHeight) * ratio)
		if newWidth > maxWidth {
			newWidth = maxWidth
			newHeight = int(float64(maxWidth) / ratio)
		}
	}

	// Create new image
	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

	// Use bilinear scaling
	draw.BiLinear.Scale(dst, dst.Bounds(), src, src.Bounds(), draw.Over, nil)

	return dst
}

// saveImage saves an image to disk with specified quality
func (us *UploadService) saveImage(img image.Image, filePath, format string, quality int) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	switch format {
	case "jpeg", "jpg":
		return jpeg.Encode(file, img, &jpeg.Options{Quality: quality})
	case "png":
		return png.Encode(file, img)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
}

// DeleteFile deletes an uploaded file
func (us *UploadService) DeleteFile(filename, uploadDir string) error {
	// Security check
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		return errors.New("invalid filename")
	}

	filePath := filepath.Join(uploadDir, filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return errors.New("file not found")
	}

	return os.Remove(filePath)
}
