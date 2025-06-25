"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminDashboardService } from "../services/admin-dashboard-service";
import { AdminStats, RecentActivity } from "@/types/admin-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStatsCards } from "@/features/admin/components/admin-stats-cards";
import { AdminRecentActivity } from "@/features/admin/components/admin-recent-activity";
import { AdminUserManagement } from "@/features/admin/components/admin-user-management";
import { AdminSystemStats } from "@/features/admin/components/admin-system-stats";
import { AdminQuickActions } from "@/features/admin/components/admin-quick-actions";
import { KULoading } from "@/components/ui/ku-loading";
import { useToast } from "@/components/ui/use-toast";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        AdminDashboardService.getAdminStats(),
        AdminDashboardService.getRecentActivity(5),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <KULoading variant="dashboard" message="กำลังโหลดข้อมูลแดชบอร์ด..." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            จัดการระบบ KU Asset แบบครบครัน
          </p>
        </div>
        <AdminQuickActions onRefresh={loadDashboardData} />
      </div>

      {/* Stats Cards */}
      {stats && <AdminStatsCards stats={stats} />}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="users">จัดการผู้ใช้</TabsTrigger>
          <TabsTrigger value="statistics">สถิติ</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminRecentActivity activities={recentActivity} />
            <AdminSystemStats />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="statistics">
          <AdminSystemStats detailed />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              การตั้งค่าระบบจะเพิ่มในเร็วๆ นี้
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
