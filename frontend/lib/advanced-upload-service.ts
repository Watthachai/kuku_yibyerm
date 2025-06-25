import {
  CDNConfig,
  UploadValidationConfig,
  ImageOptimizationConfig,
  UploadProgress,
  UploadResult,
  getCurrentCDNConfig,
  DEFAULT_VALIDATION_CONFIG,
  DEFAULT_OPTIMIZATION_CONFIG,
} from "./upload-config";
import { getSession } from "next-auth/react";

export class AdvancedUploadService {
  private config: CDNConfig;
  private validationConfig: UploadValidationConfig;
  private optimizationConfig: ImageOptimizationConfig;

  constructor(
    validationConfig = DEFAULT_VALIDATION_CONFIG,
    optimizationConfig = DEFAULT_OPTIMIZATION_CONFIG
  ) {
    this.config = getCurrentCDNConfig();
    this.validationConfig = validationConfig;
    this.optimizationConfig = optimizationConfig;
  }

  // ⭐ Client-side file validation
  async validateFile(file: File): Promise<void> {
    // Size validation
    if (file.size > this.validationConfig.maxFileSize) {
      throw new Error(
        `File size ${this.formatFileSize(
          file.size
        )} exceeds maximum allowed size ${this.formatFileSize(
          this.validationConfig.maxFileSize
        )}`
      );
    }

    // Type validation
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!this.validationConfig.allowedTypes.includes(fileExt)) {
      throw new Error(`File type ${fileExt} is not allowed`);
    }

    // MIME type validation
    if (!this.validationConfig.allowedMimeTypes.includes(file.type)) {
      throw new Error(`MIME type ${file.type} is not allowed`);
    }

    // Image dimension validation (if applicable)
    if (
      file.type.startsWith("image/") &&
      (this.validationConfig.maxWidth || this.validationConfig.maxHeight)
    ) {
      const dimensions = await this.getImageDimensions(file);

      if (
        this.validationConfig.maxWidth &&
        dimensions.width > this.validationConfig.maxWidth
      ) {
        throw new Error(
          `Image width ${dimensions.width}px exceeds maximum ${this.validationConfig.maxWidth}px`
        );
      }

      if (
        this.validationConfig.maxHeight &&
        dimensions.height > this.validationConfig.maxHeight
      ) {
        throw new Error(
          `Image height ${dimensions.height}px exceeds maximum ${this.validationConfig.maxHeight}px`
        );
      }

      // Aspect ratio validation
      if (
        this.validationConfig.enforceAspectRatio &&
        this.validationConfig.aspectRatio
      ) {
        const aspectRatio = dimensions.width / dimensions.height;
        const tolerance = 0.1; // 10% tolerance
        const expectedRatio = this.validationConfig.aspectRatio;

        if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
          throw new Error(
            `Image aspect ratio ${aspectRatio.toFixed(
              2
            )} does not match required ratio ${expectedRatio.toFixed(2)}`
          );
        }
      }
    }
  }

  // ⭐ Client-side image optimization/resize
  async optimizeImage(file: File): Promise<File> {
    if (
      !file.type.startsWith("image/") ||
      !this.optimizationConfig.autoResize
    ) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width: newWidth, height: newHeight } =
            this.calculateOptimalDimensions(
              img.width,
              img.height,
              this.optimizationConfig.maxWidth,
              this.optimizationConfig.maxHeight
            );

          // Set canvas dimensions
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and resize image
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: this.getOptimalMimeType(),
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                reject(new Error("Failed to optimize image"));
              }
            },
            this.getOptimalMimeType(),
            this.optimizationConfig.quality / 100
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  // ⭐ Upload with progress tracking
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file first
    await this.validateFile(file);

    // Optimize if needed
    const optimizedFile = await this.optimizeImage(file);

    // Upload based on CDN configuration
    if (this.config.enabled && this.config.provider === "cloudinary") {
      return this.uploadToCloudinary(optimizedFile, onProgress);
    } else {
      return this.uploadToBackend(optimizedFile, onProgress);
    }
  }

  // ⭐ Upload to local backend
  private async uploadToBackend(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("image", file);

    // Get auth headers
    const session = await getSession();
    const headers: Record<string, string> = {};
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: (event.loaded / event.total) * 100,
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || "Upload failed"));
            }
          } catch {
            reject(new Error("Invalid response format"));
          }
        } else if (xhr.status === 429) {
          reject(new Error("Rate limit exceeded. Please try again later."));
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(
              new Error(response.error || `HTTP ${xhr.status}: Upload failed`)
            );
          } catch {
            reject(new Error(`HTTP ${xhr.status}: Upload failed`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      // Set timeout (30 seconds)
      xhr.timeout = 30000;

      // Open request
      const url = `${this.config.baseUrl}${this.config.uploadEndpoint}`;
      xhr.open("POST", url);

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Send request
      xhr.send(formData);
    });
  }

  // ⭐ Upload to Cloudinary
  private async uploadToCloudinary(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    if (!this.config.cloudName || !this.config.uploadPreset) {
      throw new Error("Cloudinary configuration missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.config.uploadPreset);
    formData.append("folder", "products");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: (event.loaded / event.total) * 100,
            };
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              filename: response.public_id,
              size: response.bytes,
              originalName: file.name,
              mimeType: file.type,
              width: response.width,
              height: response.height,
              cdnUrl: response.secure_url,
            });
          } catch {
            reject(new Error("Invalid Cloudinary response"));
          }
        } else {
          reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Cloudinary upload error"));
      });

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`;
      xhr.open("POST", cloudinaryUrl);
      xhr.send(formData);
    });
  }

  // ⭐ Helper methods
  private async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  private getOptimalMimeType(): string {
    if (this.optimizationConfig.format === "auto") {
      // Use WebP if supported, otherwise keep original
      return "image/webp";
    }
    return `image/${this.optimizationConfig.format}`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
