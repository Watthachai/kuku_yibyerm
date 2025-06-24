// ⭐ CDN Configuration for production
export interface CDNConfig {
  enabled: boolean;
  provider: "aws-s3" | "cloudinary" | "local";
  baseUrl: string;
  uploadEndpoint: string;
  apiKey?: string;
  cloudName?: string; // for Cloudinary
  uploadPreset?: string; // for Cloudinary
}

// ⭐ Upload validation configuration
export interface UploadValidationConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  allowedMimeTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  enforceAspectRatio?: boolean;
  aspectRatio?: number; // width/height
}

// ⭐ Image optimization settings
export interface ImageOptimizationConfig {
  autoResize: boolean;
  maxWidth: number;
  maxHeight: number;
  quality: number; // 1-100
  format: "auto" | "webp" | "jpeg" | "png";
  progressive: boolean;
}

// ⭐ Upload progress tracking
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

// ⭐ Upload result with metadata
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  originalName: string;
  mimeType: string;
  width?: number;
  height?: number;
  optimized?: boolean;
  cdnUrl?: string;
}

// ⭐ Error handling
export interface UploadError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ⭐ Default configurations
export const DEFAULT_VALIDATION_CONFIG: UploadValidationConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [".jpg", ".jpeg", ".png", ".webp"],
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxWidth: 1920,
  maxHeight: 1080,
};

export const DEFAULT_OPTIMIZATION_CONFIG: ImageOptimizationConfig = {
  autoResize: true,
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: "auto",
  progressive: true,
};

export const CDN_CONFIGS: Record<string, CDNConfig> = {
  development: {
    enabled: false,
    provider: "local",
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
    uploadEndpoint: "/api/v1/upload/product-image",
  },

  production: {
    enabled: true,
    provider:
      (process.env.NEXT_PUBLIC_CDN_PROVIDER as
        | "aws-s3"
        | "cloudinary"
        | "local") || "aws-s3",
    baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || "",
    uploadEndpoint:
      process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT || "/api/v1/upload/product-image",
    apiKey: process.env.NEXT_PUBLIC_CDN_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  },
};

export function getCurrentCDNConfig(): CDNConfig {
  const env = process.env.NODE_ENV || "development";
  return CDN_CONFIGS[env] || CDN_CONFIGS.development;
}
