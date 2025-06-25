"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAuthHeadersForFormData } from "@/lib/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
  maxSizeInMB?: number;
  accept?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  maxSizeInMB = 5,
  accept = "image/*",
  placeholder = "อัปโหลดรูปภาพ",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`ไฟล์ใหญ่เกินไป (สูงสุด ${maxSizeInMB}MB)`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("image", file);

        const headers = await getAuthHeadersForFormData();

        // Use the correct API base URL for development
        const baseURL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const uploadURL = `${baseURL}/api/v1/upload/product-image`;

        const response = await fetch(uploadURL, {
          method: "POST",
          body: formData,
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        if (result.success && result.data?.url) {
          onChange(result.data.url);
          toast.success("อัปโหลดรูปภาพสำเร็จ 📸");
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("ไม่สามารถอัปโหลดรูปภาพได้");
      } finally {
        setUploading(false);
      }
    },
    [maxSizeInMB, onChange]
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Image Display */}
      {value && (
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
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "h-64 lg:h-80",
            "p-8",
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4 h-full">
            {uploading ? (
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}

            <div className="text-center">
              <p className="text-base font-medium text-gray-900 mb-2">
                {uploading ? "กำลังอัปโหลด..." : placeholder}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF, WebP (สูงสุด {maxSizeInMB}MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload Button */}
      {!value && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="w-full h-11"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพ"}
        </Button>
      )}
    </div>
  );
}
