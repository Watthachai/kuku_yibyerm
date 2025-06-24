"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductCardSkeletonProps {
  variant?: "default" | "compact" | "featured";
}

export function ProductCardSkeleton({
  variant = "compact",
}: ProductCardSkeletonProps) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full" />

      {/* Content */}
      <div className={`space-y-3 ${variant === "compact" ? "p-3" : "p-4"}`}>
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Product Name */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Serial Number */}
        <Skeleton className="h-3 w-20" />

        {/* Action Button */}
        <Skeleton
          className={`w-full ${variant === "compact" ? "h-9" : "h-10"}`}
        />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} variant="compact" />
      ))}
    </div>
  );
}
