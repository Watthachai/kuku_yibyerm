import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KULoading } from "@/components/ui/ku-loading";
import { AdminStats } from "@/types/admin-dashboard";
import {
  Users,
  Package,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface AdminStatsCardsProps {
  stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  // ⭐ เพิ่ม debug logs
  console.log("🔍 AdminStatsCards received stats:", stats);
  console.log("🔍 Stats type:", typeof stats);
  console.log("🔍 Stats keys:", stats ? Object.keys(stats) : "no stats");

  const formatValue = (value: number | undefined) => {
    console.log("🔍 Formatting value:", value, "type:", typeof value);
    if (value == null || value === undefined) return "0";
    return value.toLocaleString();
  };

  // ⭐ คำนวณค่าต่างๆ จากข้อมูลจริง
  const calculations = {
    // Total requests ทั้งหมด
    totalRequests:
      (stats?.pendingRequests || 0) +
      (stats?.approvedRequests || 0) +
      (stats?.rejectedRequests || 0) +
      (stats?.completedRequests || 0),

    // % ของ Active Users
    activeUserPercentage:
      stats?.totalUsers > 0
        ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
        : 0,

    // % ของ Low Stock Products
    lowStockPercentage:
      stats?.totalProducts > 0
        ? Math.round((stats.lowStockProducts / stats.totalProducts) * 100)
        : 0,

    // % ของ Monthly Requests เทียบกับ Total
    monthlyGrowthPercentage:
      stats?.totalUsers > 0
        ? Math.round((stats.monthlyRequests / stats.totalUsers) * 100)
        : 0,

    // Success Rate (Approved + Completed / Total)
    successRate: (() => {
      const total =
        (stats?.pendingRequests || 0) +
        (stats?.approvedRequests || 0) +
        (stats?.rejectedRequests || 0) +
        (stats?.completedRequests || 0);
      if (total === 0) return 0;
      const successful =
        (stats?.approvedRequests || 0) + (stats?.completedRequests || 0);
      return Math.round((successful / total) * 100);
    })(),

    // Average requests per user
    avgRequestsPerUser:
      stats?.totalUsers > 0
        ? ((stats?.pendingRequests || 0) +
            (stats?.approvedRequests || 0) +
            (stats?.rejectedRequests || 0) +
            (stats?.completedRequests || 0)) /
          stats.totalUsers
        : 0,
  };

  console.log("🔍 Calculated values:", calculations);

  // ⭐ Primary Stats - ใช้การคำนวณแบบ Dynamic
  const primaryStats = [
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: `${stats?.activeUsers || 0} คน (${
        calculations.activeUserPercentage
      }%) ใช้งานล่าสุด`,
      trend:
        calculations.activeUserPercentage > 50
          ? `${calculations.activeUserPercentage}% ผู้ใช้งานออนไลน์`
          : `เพียง ${calculations.activeUserPercentage}% ผู้ใช้งานออนไลน์`,
      color:
        calculations.activeUserPercentage > 50
          ? "text-green-600"
          : "text-blue-600",
      bgColor:
        calculations.activeUserPercentage > 50
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-blue-50 dark:bg-blue-900/20",
      iconColor:
        calculations.activeUserPercentage > 50 ? "bg-green-500" : "bg-blue-500",
    },
    {
      title: "ครุภัณฑ์ในระบบ",
      value: stats?.totalProducts || 0,
      icon: Package,
      description: `${stats?.lowStockProducts || 0} รายการ (${
        calculations.lowStockPercentage
      }%) เหลือน้อย`,
      trend:
        calculations.lowStockPercentage > 20
          ? `⚠️ สต็อกต่ำ ${calculations.lowStockPercentage}%`
          : calculations.lowStockPercentage > 0
          ? `เหลือน้อย ${calculations.lowStockPercentage}%`
          : "สต็อกเพียงพอ",
      color:
        calculations.lowStockPercentage > 20
          ? "text-red-600"
          : calculations.lowStockPercentage > 0
          ? "text-orange-600"
          : "text-green-600",
      bgColor:
        calculations.lowStockPercentage > 20
          ? "bg-red-50 dark:bg-red-900/20"
          : calculations.lowStockPercentage > 0
          ? "bg-orange-50 dark:bg-orange-900/20"
          : "bg-green-50 dark:bg-green-900/20",
      iconColor:
        calculations.lowStockPercentage > 20
          ? "bg-red-500"
          : calculations.lowStockPercentage > 0
          ? "bg-orange-500"
          : "bg-green-500",
      alert: calculations.lowStockPercentage > 20,
    },
    {
      title: "คำขอรออนุมัติ",
      value: stats?.pendingRequests || 0,
      icon: Clock,
      description: `จากทั้งหมด ${calculations.totalRequests} คำขอ`,
      trend: (() => {
        const pendingCount = stats?.pendingRequests || 0;
        if (pendingCount === 0) return "ไม่มีคำขอรอ";
        if (pendingCount === 1) return "มี 1 คำขอรออนุมัติ";
        if (pendingCount <= 5) return `มี ${pendingCount} คำขอรอ (ปกติ)`;
        if (pendingCount <= 10)
          return `มี ${pendingCount} คำขอรอ (ค่อนข้างเยอะ)`;
        return `มี ${pendingCount} คำขอรอ (มากเกินไป!)`;
      })(),
      urgent: (stats?.pendingRequests || 0) > 10,
      color: (() => {
        const pendingCount = stats?.pendingRequests || 0;
        if (pendingCount === 0) return "text-green-600";
        if (pendingCount <= 5) return "text-yellow-600";
        if (pendingCount <= 10) return "text-orange-600";
        return "text-red-600";
      })(),
      bgColor: (() => {
        const pendingCount = stats?.pendingRequests || 0;
        if (pendingCount === 0) return "bg-green-50 dark:bg-green-900/20";
        if (pendingCount <= 5) return "bg-yellow-50 dark:bg-yellow-900/20";
        if (pendingCount <= 10) return "bg-orange-50 dark:bg-orange-900/20";
        return "bg-red-50 dark:bg-red-900/20";
      })(),
      iconColor: (() => {
        const pendingCount = stats?.pendingRequests || 0;
        if (pendingCount === 0) return "bg-green-500";
        if (pendingCount <= 5) return "bg-yellow-500";
        if (pendingCount <= 10) return "bg-orange-500";
        return "bg-red-500";
      })(),
    },
    {
      title: "คำขอเดือนนี้",
      value: stats?.monthlyRequests || 0,
      icon: TrendingUp,
      description: `เฉลี่ย ${calculations.avgRequestsPerUser.toFixed(
        1
      )} คำขอ/คน`,
      trend: (() => {
        const monthlyCount = stats?.monthlyRequests || 0;
        const totalCount = calculations.totalRequests;
        if (totalCount === 0) return "ยังไม่มีข้อมูล";
        const percentage = Math.round((monthlyCount / totalCount) * 100);
        if (percentage >= 50)
          return `${percentage}% ของคำขอทั้งหมด (เดือนนี้ยอดนิยม!)`;
        if (percentage >= 25)
          return `${percentage}% ของคำขอทั้งหมด (เดือนนี้ดี)`;
        if (percentage > 0) return `${percentage}% ของคำขอทั้งหมด`;
        return "ยังไม่มีคำขอเดือนนี้";
      })(),
      color: (() => {
        const monthlyCount = stats?.monthlyRequests || 0;
        const totalCount = calculations.totalRequests;
        if (totalCount === 0) return "text-gray-600";
        const percentage = (monthlyCount / totalCount) * 100;
        if (percentage >= 50) return "text-purple-600";
        if (percentage >= 25) return "text-blue-600";
        return "text-indigo-600";
      })(),
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "bg-purple-500",
    },
  ];

  // ⭐ Secondary Stats - คำนวณค่าจริง
  const secondaryStats = [
    {
      title: "อนุมัติแล้ว",
      value: stats?.approvedRequests || 0,
      icon: CheckCircle,
      color: "text-green-600",
      percentage:
        calculations.totalRequests > 0
          ? Math.round(
              ((stats?.approvedRequests || 0) / calculations.totalRequests) *
                100
            )
          : 0,
    },
    {
      title: "ปฏิเสธ",
      value: stats?.rejectedRequests || 0,
      icon: XCircle,
      color: "text-red-600",
      percentage:
        calculations.totalRequests > 0
          ? Math.round(
              ((stats?.rejectedRequests || 0) / calculations.totalRequests) *
                100
            )
          : 0,
    },
    {
      title: "เสร็จสิ้น",
      value: stats?.completedRequests || 0,
      icon: Calendar,
      color: "text-blue-600",
      percentage:
        calculations.totalRequests > 0
          ? Math.round(
              ((stats?.completedRequests || 0) / calculations.totalRequests) *
                100
            )
          : 0,
    },
    {
      title: "หน่วยงาน",
      value: stats?.totalDepartments || 0,
      icon: Building2,
      color: "text-indigo-600",
      avgUsers:
        stats?.totalDepartments > 0
          ? Math.round(
              (stats?.totalUsers || 0) / (stats?.totalDepartments || 1)
            )
          : 0,
    },
  ];

  // ⭐ เพิ่ม debug log สำหรับ primaryStats
  console.log("🔍 Generated primaryStats:", primaryStats);

  // ⭐ ถ้า stats เป็น null หรือ undefined
  if (!stats) {
    console.log("❌ No stats provided to AdminStatsCards");
    return <KULoading variant="cards" message="กำลังโหลดสถิติระบบ..." />;
  }

  return (
    <div className="space-y-6">
      {/* คำขอที่ต้องดำเนินการด่วน */}
      {(stats?.pendingRequests || 0) > 5 && (
        <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border-l-4 border-orange-500 dark:border-orange-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-300 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-orange-900 dark:text-orange-100 font-semibold">
                ⚠️ แจ้งเตือน: มีคำขอรออนุมัติ {stats?.pendingRequests} รายการ
              </h4>
              <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                ควรดำเนินการอนุมัติหรือปฏิเสธคำขอเหล่านี้ในเร็วๆ นี้
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Rate Banner */}
      {calculations.successRate > 0 && (
        <div
          className={`p-4 rounded-lg border-l-4 shadow-sm ${
            calculations.successRate >= 80
              ? "bg-green-50 dark:bg-green-900/30 border-green-500"
              : calculations.successRate >= 60
              ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500"
              : "bg-red-50 dark:bg-red-900/30 border-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4
                className={`font-semibold ${
                  calculations.successRate >= 80
                    ? "text-green-900 dark:text-green-100"
                    : calculations.successRate >= 60
                    ? "text-yellow-900 dark:text-yellow-100"
                    : "text-red-900 dark:text-red-100"
                }`}
              >
                🎯 อัตราความสำเร็จ: {calculations.successRate}%
              </h4>
              <p
                className={`text-sm font-medium ${
                  calculations.successRate >= 80
                    ? "text-green-800 dark:text-green-200"
                    : calculations.successRate >= 60
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                จากคำขอทั้งหมด {calculations.totalRequests} รายการ
              </p>
            </div>
            <div
              className={`text-2xl font-bold ${
                calculations.successRate >= 80
                  ? "text-green-600 dark:text-green-300"
                  : calculations.successRate >= 60
                  ? "text-yellow-600 dark:text-yellow-300"
                  : "text-red-600 dark:text-red-300"
              }`}
            >
              {calculations.successRate >= 80
                ? "🎉"
                : calculations.successRate >= 60
                ? "👍"
                : "📈"}
            </div>
          </div>
        </div>
      )}

      {/* Primary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {primaryStats.map((item, index) => {
          console.log(
            `🔍 Rendering card ${index}:`,
            item.title,
            "value:",
            item.value
          );
          return (
            <Card
              key={item.title}
              className={`hover:shadow-lg transition-all duration-300 ${
                item.urgent
                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 ring-2 ring-orange-200 dark:ring-orange-800"
                  : item.bgColor
                  ? `bg-gradient-to-br from-${
                      item.bgColor
                    } to-${item.bgColor.replace("50", "100")}`
                  : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${item.iconColor}`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatValue(item.value)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  {item.urgent && (
                    <Badge
                      variant="destructive"
                      className="bg-red-600 text-white font-semibold shadow-md"
                    >
                      ⚠️ ด่วน!
                    </Badge>
                  )}
                  {item.alert && (
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs ${item.color} dark:brightness-125 font-medium`}
                  >
                    {item.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((item) => (
          <Card key={item.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.title}
                  </p>
                  <p
                    className={`text-xl font-bold ${item.color} dark:brightness-110`}
                  >
                    {formatValue(item.value)}
                  </p>
                  {/* ⭐ แสดง % หรือข้อมูลเพิ่มเติม */}
                  {item.percentage !== undefined &&
                    calculations.totalRequests > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percentage}% ของทั้งหมด
                      </p>
                    )}
                  {item.avgUsers !== undefined && item.avgUsers > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      เฉลี่ย {item.avgUsers} คน/หน่วย
                    </p>
                  )}
                </div>
                <item.icon
                  className={`h-5 w-5 ${item.color} dark:brightness-110`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
