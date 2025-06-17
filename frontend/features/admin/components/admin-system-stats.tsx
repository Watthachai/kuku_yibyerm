"use client";

import { useState, useEffect } from "react";
import { SystemStats } from "@/types/admin-dashboard";
import { AdminDashboardService } from "../services/admin-dashboard-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AdminSystemStatsProps {
  detailed?: boolean;
}

export function AdminSystemStats({ detailed = false }: AdminSystemStatsProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const systemStats = await AdminDashboardService.getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error("Error loading system stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SystemStatsSkeleton detailed={detailed} />;
  }

  if (!stats) {
    return null;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Monthly Requests Chart */}
        <Card>
          <CardHeader>
            <CardTitle>คำขอรายเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.requestsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Requested Items */}
          <Card>
            <CardHeader>
              <CardTitle>ครุภัณฑ์ที่ขอยืมมากที่สุด</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topRequestedItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Usage */}
          <Card>
            <CardHeader>
              <CardTitle>การใช้งานตามหน่วยงาน</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.departmentUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.departmentUsage.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติระบบ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">ครุภัณฑ์ยอดนิยม</h4>
              <div className="space-y-2">
                {stats.topRequestedItems.slice(0, 3).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="font-medium">{item.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">หน่วยงานที่ใช้มากที่สุด</h4>
              <div className="space-y-2">
                {stats.departmentUsage.slice(0, 3).map((dept) => (
                  <div
                    key={dept.department}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{dept.department}</span>
                    <span className="font-medium">{dept.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">แนวโน้มคำขอ 3 เดือนที่ผ่านมา</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.requestsByMonth}>
                <Bar dataKey="count" fill="#8884d8" />
                <XAxis dataKey="month" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatsSkeleton({ detailed }: { detailed?: boolean }) {
  if (detailed) {
    return (
      <div className="space-y-6">
        <div className="h-80 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
          <div className="h-80 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
