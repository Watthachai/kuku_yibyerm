# Enhanced Upload System Documentation

## Overview

เราได้ปรับปรุงระบบอัปโหลดรูปภาพให้มีความสามารถขั้นสูง รวมถึง validation, optimization, rate limiting และรองรับ CDN

## Backend Improvements

### 1. Upload Service (`services/upload_service.go`)

- **Image Processing**: รองรับการปรับขนาดรูปภาพอัตโนมัติ
- **Quality Control**: ปรับ JPEG quality ได้
- **Format Support**: JPEG, PNG, WebP
- **Security**: File validation และ path traversal protection

### 2. Rate Limiting (`middleware/rate_limiter.go`)

- **Upload Limits**: 10 uploads ต่อนาที, 50 uploads ต่อชั่วโมง
- **User-based**: Rate limiting ตาม user ID หรือ IP address
- **Memory Efficient**: Auto cleanup expired entries

### 3. Enhanced Controller (`controllers/upload_controller.go`)

- ใช้ Upload Service สำหรับ validation และ processing
- Return metadata เพิ่มเติม (dimensions, optimized size)
- Error handling ที่ดีขึ้น

## Frontend Improvements

### 1. Advanced Upload Service (`lib/advanced-upload-service.ts`)

**Features:**

- Client-side validation (size, type, dimensions)
- Image optimization (resize, quality adjustment)
- Progress tracking
- Retry mechanism
- CDN support (Cloudinary, AWS S3)

**Configuration Options:**

```typescript
const validationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [".jpg", ".jpeg", ".png", ".webp"],
  maxWidth: 1920,
  maxHeight: 1080,
  enforceAspectRatio: false,
};

const optimizationConfig = {
  autoResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: "auto", // webp, jpeg, png
};
```

### 2. Advanced Image Upload Component (`components/ui/advanced-image-upload.tsx`)

**Features:**

- Real-time progress bar
- Drag & drop support
- Image preview with metadata
- Error handling with retry
- Optimization info display
- Responsive design

**Usage:**

```tsx
<AdvancedImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  showProgress={true}
  showOptimizationInfo={true}
  validationConfig={{ maxFileSize: 5 * 1024 * 1024 }}
  optimizationConfig={{ quality: 85 }}
/>
```

### 3. CDN Configuration (`lib/upload-config.ts`)

รองรับ CDN providers หลายตัว:

- **Local**: สำหรับ development
- **Cloudinary**: สำหรับ production
- **AWS S3**: สำหรับ enterprise

## Configuration

### Environment Variables

#### Development (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### Production

```env
# CDN Configuration
NEXT_PUBLIC_CDN_PROVIDER=cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Or for AWS S3
NEXT_PUBLIC_CDN_PROVIDER=aws-s3
NEXT_PUBLIC_CDN_BASE_URL=https://your-bucket.s3.amazonaws.com
```

### Backend Configuration

```go
// In upload_service.go
config := &UploadConfig{
    MaxFileSize: 5 * 1024 * 1024, // 5MB
    MaxWidth:    1920,
    MaxHeight:   1080,
    Quality:     85,
}
```

## Security Features

### 1. File Validation

- ✅ File size limits
- ✅ File type validation (extension + MIME type)
- ✅ Image dimension limits
- ✅ Path traversal protection
- ✅ Malicious filename detection

### 2. Rate Limiting

- ✅ Per-user upload limits
- ✅ IP-based fallback
- ✅ Configurable time windows
- ✅ Memory efficient cleanup

### 3. Authentication

- ✅ JWT token validation
- ✅ Admin-only upload access
- ✅ CORS protection

## Performance Optimizations

### 1. Image Processing

- **Auto-resize**: ลดขนาดรูปภาพใหญ่อัตโนมัติ
- **Quality adjustment**: ปรับ quality เพื่อลดขนาดไฟล์
- **Format optimization**: แปลงเป็น WebP เมื่อเป็นไปได้
- **Progressive JPEG**: สำหรับการโหลดที่เร็วขึ้น

### 2. Upload Experience

- **Progress tracking**: แสดงความคืบหน้า real-time
- **Client-side validation**: ลด server load
- **Retry mechanism**: เพิ่มความน่าเชื่อถือ
- **CDN integration**: ลด bandwidth ของ server

### 3. Memory Management

- **Stream processing**: ไม่เก็บไฟล์ทั้งหมดใน memory
- **Auto cleanup**: ลบ temporary files อัตโนมัติ
- **Rate limiter cleanup**: ลบ expired entries

## Usage Examples

### Basic Upload

```tsx
import { AdvancedImageUpload } from "@/components/ui/advanced-image-upload";

function ProductForm() {
  const [imageUrl, setImageUrl] = useState<string>();

  return (
    <AdvancedImageUpload
      value={imageUrl}
      onChange={setImageUrl}
      placeholder="อัปโหลดรูปภาพสินค้า"
    />
  );
}
```

### Advanced Configuration

```tsx
<AdvancedImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  validationConfig={{
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxWidth: 1200,
    maxHeight: 800,
    enforceAspectRatio: true,
    aspectRatio: 3 / 2, // 3:2 ratio
  }}
  optimizationConfig={{
    autoResize: true,
    quality: 90,
    format: "webp",
  }}
  showProgress={true}
  showOptimizationInfo={true}
  allowRetry={true}
/>
```

## Error Handling

### Common Error Scenarios

1. **File too large**: แสดงขนาดไฟล์และ limit
2. **Invalid format**: แสดงรายการ format ที่รองรับ
3. **Network error**: ให้ retry option
4. **Rate limit**: แสดงเวลาที่ต้องรอ
5. **Server error**: แสดง generic error message

### Rate Limit Response

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

## CDN Integration

### Cloudinary Setup

1. สร้าง account ที่ Cloudinary
2. สร้าง upload preset (unsigned)
3. เพิ่ม environment variables
4. Upload จะไปที่ Cloudinary โดยตรง

### Benefits

- 🚀 **Faster uploads**: Direct to CDN
- 🌍 **Global delivery**: CDN edge locations
- 📱 **Automatic optimization**: Responsive images
- 💾 **Reduced server load**: Offload static assets

## Monitoring & Analytics

### Upload Metrics

- Upload success/failure rates
- Average upload time
- File size distribution
- Rate limit hits
- Popular image formats

### Performance Monitoring

- Image optimization ratio
- CDN vs local upload performance
- Client-side vs server-side processing time

## Future Enhancements

### Potential Improvements

1. **Multi-file upload**: รองรับอัปโหลดหลายไฟล์พร้อมกัน
2. **Background processing**: Queue-based image processing
3. **Smart cropping**: AI-powered crop suggestions
4. **Watermarking**: เพิ่ม watermark อัตโนมัติ
5. **Metadata extraction**: EXIF data extraction
6. **Duplicate detection**: ตรวจสอบรูปภาพซ้ำ

### Scalability Considerations

1. **Database optimization**: เก็บ metadata ใน database
2. **Caching**: Cache processed images
3. **Load balancing**: Multiple upload servers
4. **Storage tiering**: Hot/cold storage strategy
