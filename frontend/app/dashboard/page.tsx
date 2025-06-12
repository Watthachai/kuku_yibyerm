"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { generateMockDashboardData } from "@/features/dashboard/data/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/sign-in");
    }
  }, [status]);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  // Generate dashboard data based on user role
  const userRole = (session.user.role as "ADMIN" | "USER") || "USER";
  const dashboardData = generateMockDashboardData(userRole);

  return <DashboardLayout data={dashboardData} />;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="ku-bg-card ku-border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <Skeleton className="h-64 rounded-lg" />

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
