"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdvancedUploadService } from "@/lib/advanced-upload-service";
import {
  UploadProgress,
  UploadResult,
  UploadValidationConfig,
  ImageOptimizationConfig,
} from "@/lib/upload-config";

interface AdvancedImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;

  // ⭐ Advanced configuration
  validationConfig?: Partial<UploadValidationConfig>;
  optimizationConfig?: Partial<ImageOptimizationConfig>;

  // ⭐ UI customization
  showProgress?: boolean;
  showOptimizationInfo?: boolean;
  showValidationErrors?: boolean;
  allowRetry?: boolean;
}

export function AdvancedImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "อัปโหลดรูปภาพ",
  validationConfig,
  optimizationConfig,
  showProgress = true,
  showOptimizationInfo = true,
  showValidationErrors = true,
  allowRetry = true,
}: AdvancedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadServiceRef = useRef<AdvancedUploadService | null>(null);

  // Initialize upload service
  const getUploadService = useCallback(() => {
    if (!uploadServiceRef.current) {
      uploadServiceRef.current = new AdvancedUploadService(
        validationConfig as UploadValidationConfig,
        optimizationConfig as ImageOptimizationConfig
      );
    }
    return uploadServiceRef.current;
  }, [validationConfig, optimizationConfig]);

  const uploadImage = useCallback(
    async (file: File, isRetry = false) => {
      const uploadService = getUploadService();

      try {
        setUploading(true);
        setError(null);
        setUploadProgress(null);
        setUploadResult(null);

        if (!isRetry) {
          setRetryCount(0);
        }

        // Upload with progress tracking
        const result = await uploadService.uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });

        setUploadResult(result);
        onChange(result.url);

        // Show success message with optimization info
        let successMessage = "อัปโหลดรูปภาพสำเร็จ 📸";
        if (showOptimizationInfo && result.width && result.height) {
          successMessage += ` (${result.width}×${
            result.height
          }px, ${formatFileSize(result.size)})`;
        }

        toast.success(successMessage);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้";
        setError(errorMessage);

        if (showValidationErrors) {
          toast.error(errorMessage);
        }

        console.error("Upload error:", error);
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [getUploadService, onChange, showOptimizationInfo, showValidationErrors]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadImage(file);
      }
    },
    [uploadImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleRetry = useCallback(() => {
    if (fileInputRef.current?.files?.[0] && retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      uploadImage(fileInputRef.current.files[0], true);
    }
  }, [uploadImage, retryCount]);

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Image Display */}
      {value && !error && (
        <div className="relative group">
          <div className="relative w-full h-64 lg:h-80 bg-gray-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Product preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.png";
              }}
            />

            {/* Remove Button */}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Upload Info Overlay */}
            {uploadResult && showOptimizationInfo && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>
                  {uploadResult.width}×{uploadResult.height}px •{" "}
                  {formatFileSize(uploadResult.size)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "h-64 lg:h-80 p-8",
            dragOver
              ? "border-blue-500 bg-blue-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4 h-full">
            {/* Upload Icon/Status */}
            {uploading ? (
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            ) : error ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}

            {/* Upload Text */}
            <div className="text-center">
              <p className="text-base font-medium text-gray-900 mb-2">
                {uploading
                  ? "กำลังอัปโหลด..."
                  : error
                  ? "อัปโหลดไม่สำเร็จ"
                  : placeholder}
              </p>

              {!uploading && !error && (
                <>
                  <p className="text-sm text-gray-500 mb-1">
                    ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, WebP • สูงสุด 5MB • ขนาดแนะนำ 1920×1080px
                  </p>
                </>
              )}

              {/* Error Message */}
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            {/* Progress Bar */}
            {uploading && uploadProgress && showProgress && (
              <div className="w-full max-w-xs">
                <Progress value={uploadProgress.percentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress.percentage.toFixed(1)}% •{" "}
                  {formatFileSize(uploadProgress.loaded)} /{" "}
                  {formatFileSize(uploadProgress.total)}
                </p>
              </div>
            )}

            {/* Retry Button */}
            {error && allowRetry && retryCount < 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="mt-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                ลองใหม่ ({3 - retryCount} ครั้งที่เหลือ)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload Button */}
      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className="w-full h-11"
        >
          <Upload className="w-4 h-4 mr-2" />
          เลือกรูปภาพ
        </Button>
      )}
    </div>
  );
}
