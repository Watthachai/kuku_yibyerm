/* สร้างไฟล์: /Users/itswatthachai/kuku_yibyerm/frontend/features/dashboard/components/DashboardLayout.tsx */
"use client";

import Image from "next/image";
import * as React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/features/dashboard/StatsCard";
import { QuickActions } from "@/features/dashboard/QuickActions";
import { RecentActivity } from "@/features/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DashboardData } from "./types";

interface DashboardLayoutProps {
  data: DashboardData;
}

export function DashboardLayout({ data }: DashboardLayoutProps) {
  const { user, stats, recentItems, recentActivity, quickActions } = data;
  const isAdmin = user.role === "ADMIN";

  // Generate stats for StatsCard
  const userStats = [
    {
      title: isAdmin ? "อุปกรณ์ทั้งหมด" : "อุปกรณ์ที่ยืม",
      value: isAdmin ? stats.totalItems : stats.borrowedItems,
      icon: Package,
      color: "emerald" as const,
      change: isAdmin
        ? { value: 12, label: "เดือนนี้", trend: "up" as const }
        : undefined,
    },
    {
      title: isAdmin ? "ผู้ใช้ที่ใช้งาน" : "รอการคืน",
      value: isAdmin ? stats.activeUsers! : stats.pendingReturns,
      icon: isAdmin ? Users : Clock,
      color: "blue" as const,
      change: isAdmin
        ? { value: 8, label: "สัปดาห์นี้", trend: "up" as const }
        : undefined,
    },
    {
      title: isAdmin ? "รายการค้างคืน" : "เลยกำหนด",
      value: stats.overdueItems,
      icon: AlertTriangle,
      color: stats.overdueItems > 0 ? ("red" as const) : ("emerald" as const),
      change: { value: 5, label: "ลดลง", trend: "down" as const },
    },
  ];

  if (isAdmin) {
    userStats.push({
      title: "อุปกรณ์ที่ถูกยืม",
      value: stats.borrowedItems,
      icon: TrendingUp,
      color: "blue" as const,
      change: { value: 15, label: "เดือนนี้", trend: "up" as const },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="ku-bg-card ku-border-b sticky top-0 z-10 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="ku-gradient text-white font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold ku-text-primary">
                  สวัสดี, {user.name.split(" ")[0]}! 👋
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isAdmin ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                  </Badge>
                  <span>•</span>
                  <span>{user.department}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    วันนี้
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="ku-border">
                ดูโปรไฟล์
              </Button>
              <Button size="sm" className="ku-gradient text-white">
                + ยืมอุปกรณ์
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Items */}
          <div className="lg:col-span-2">
            <Card className="ku-bg-card ku-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="ku-text-primary">
                  {isAdmin ? "อุปกรณ์ที่ถูกยืมล่าสุด" : "อุปกรณ์ที่คุณยืม"}
                </CardTitle>
                <Button variant="outline" size="sm">
                  ดูทั้งหมด
                </Button>
              </CardHeader>
              <CardContent>
                {recentItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ยังไม่มีรายการยืมอุปกรณ์</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg ku-border hover:shadow-md transition-all"
                      >
                        <Image
                          src={item.image || "/placeholder-image.png"}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                          </p>
                          {isAdmin && item.borrowerName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ยืมโดย: {item.borrowerName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              item.status === "OVERDUE"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.status === "BORROWED"
                              ? "กำลังยืม"
                              : item.status === "OVERDUE"
                              ? "เลยกำหนด"
                              : "คืนแล้ว"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            ครบกำหนด: {item.dueDate.toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity activities={recentActivity} />
          </div>
        </div>

        {/* Admin-only Section */}
        {isAdmin && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="ku-bg-card ku-border">
              <CardHeader>
                <CardTitle className="ku-text-primary">ภาพรวมระบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        การใช้งานอุปกรณ์
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(
                          (stats.borrowedItems / stats.totalItems) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(stats.borrowedItems / stats.totalItems) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        ผู้ใช้ที่ใช้งาน
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(
                          (stats.activeUsers! / stats.totalUsers!) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(stats.activeUsers! / stats.totalUsers!) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
