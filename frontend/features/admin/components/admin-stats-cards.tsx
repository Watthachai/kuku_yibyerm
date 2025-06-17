import { AdminStats } from "@/types/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Building2,
  TrendingUp,
} from "lucide-react";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const statItems = [
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers,
      icon: Users,
      description: `${stats.activeUsers} คนกำลังใช้งาน`,
      trend: "+5% จากเดือนที่แล้ว",
      color: "text-blue-600",
    },
    {
      title: "ครุภัณฑ์ทั้งหมด",
      value: stats.totalItems,
      icon: Package,
      description: "รายการในระบบ",
      trend: "+12 รายการใหม่",
      color: "text-green-600",
    },
    {
      title: "คำขอรออนุมัติ",
      value: stats.pendingRequests,
      icon: Clock,
      description: "ต้องดำเนินการ",
      trend: stats.pendingRequests > 10 ? "สูงกว่าปกติ" : "ปกติ",
      urgent: stats.pendingRequests > 10,
      color: stats.pendingRequests > 10 ? "text-orange-600" : "text-gray-600",
    },
    {
      title: "คำขอเดือนนี้",
      value: stats.monthlyRequests,
      icon: TrendingUp,
      description: `อนุมัติ ${stats.approvedRequests} รายการ`,
      trend: "+18% จากเดือนที่แล้ว",
      color: "text-purple-600",
    },
  ];

  const additionalStats = [
    {
      title: "อนุมัติแล้ว",
      value: stats.approvedRequests,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "ปฏิเสธ",
      value: stats.rejectedRequests,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "หน่วยงาน",
      value: stats.totalDepartments,
      icon: Building2,
      color: "text-indigo-600",
    },
    {
      title: "ผู้ใช้ที่ใช้งาน",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card
            key={item.title}
            className={item.urgent ? "border-orange-200 bg-orange-50" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
              <p
                className={`text-xs mt-1 ${
                  item.urgent ? "text-orange-600" : "text-green-600"
                }`}
              >
                {item.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((item) => (
          <Card key={item.title} className="border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                {item.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
