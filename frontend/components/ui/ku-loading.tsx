"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Wheat, GraduationCap, TreePine } from "lucide-react";

interface KULoadingProps {
  variant?:
    | "default"
    | "cards"
    | "dashboard"
    | "table"
    | "minimal"
    | "page"
    | "overlay";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  count?: number; // สำหรับ cards variant
}

export function KULoading({
  variant = "default",
  size = "md",
  message,
  className,
  count = 4,
}: KULoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const iconSize = sizeClasses[size];

  // Minimal loading (แค่ spinner)
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2
          className={cn(
            "animate-spin text-ku-green dark:text-ku-green",
            iconSize
          )}
        />
        {message && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </span>
        )}
      </div>
    );
  }

  // Page loading (full page overlay)
  if (variant === "page") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
          className
        )}
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Wheat
                className={cn("text-ku-green animate-bounce", iconSize)}
                style={{ animationDelay: "0ms" }}
              />
              <GraduationCap
                className={cn("text-ku-green animate-bounce", iconSize)}
                style={{ animationDelay: "150ms" }}
              />
              <TreePine
                className={cn("text-ku-green animate-bounce", iconSize)}
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <Loader2
              className={cn(
                "absolute inset-0 m-auto animate-spin text-ku-green/30",
                iconSize
              )}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {message || "กำลังโหลดระบบ..."}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Overlay loading (modal overlay)
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-xl">
          <KULoading size="lg" message={message || "กำลังดำเนินการ..."} />
        </div>
      </div>
    );
  }

  // Table loading
  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
          >
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Cards loading
  if (variant === "cards") {
    return (
      <div
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Dashboard loading (รวม cards และ content)
  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
        </div>

        {/* Stats Cards */}
        <KULoading variant="cards" count={4} />

        {/* Content Areas */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32" />
                <div className="h-40 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default loading (centered with KU theme)
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] space-y-4",
        className
      )}
    >
      {/* KU Logo Animation */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <Wheat
            className={cn(
              "text-ku-green dark:text-ku-green animate-bounce",
              iconSize
            )}
            style={{ animationDelay: "0ms" }}
          />
          <GraduationCap
            className={cn(
              "text-ku-green dark:text-ku-green animate-bounce",
              iconSize
            )}
            style={{ animationDelay: "150ms" }}
          />
          <TreePine
            className={cn(
              "text-ku-green dark:text-ku-green animate-bounce",
              iconSize
            )}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <Loader2
          className={cn(
            "absolute inset-0 m-auto animate-spin text-ku-green/30 dark:text-ku-green/30",
            iconSize
          )}
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {message || "กำลังโหลดข้อมูล..."}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ระบบจัดการครุภัณฑ์ มหาวิทยาลัยเกษตรศาสตร์
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-ku-green dark:bg-ku-green rounded-full animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton components สำหรับใช้ใน table rows
export function KUTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-200 dark:border-slate-700">
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Loading overlay สำหรับ dialog/modal
export function KULoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-xl">
        <KULoading size="lg" message={message} />
      </div>
    </div>
  );
}

// Quick loading states for common scenarios
export function KUSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-ku-green dark:text-ku-green",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Product grid loading
export function KUProductGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="animate-pulse bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        >
          <div className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-t" />
          <CardContent className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
