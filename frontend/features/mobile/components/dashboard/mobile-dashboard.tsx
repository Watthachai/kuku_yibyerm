"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "../../stores/cart.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Bell,
  Calendar,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  RequestService,
  RequestResponse,
} from "../../services/request-service";
import { ProductService } from "@/features/admin/services/product-service";
import { Product } from "../../types/product.types";
import { toast } from "sonner";

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  recentActivity: RequestResponse[];
  popularProducts: Product[];
}

export function MobileDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { getTotalItems } = useCartStore();

  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    recentActivity: [],
    popularProducts: [],
  });
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจริงจาก API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // โหลดข้อมูล requests ของผู้ใช้
        const [requests, products] = await Promise.all([
          RequestService.getMyRequests(),
          ProductService.getProducts({}), // โหลดสินค้าทั้งหมด
        ]);

        const pendingCount = requests.filter(
          (req) => req.status === "PENDING"
        ).length;
        const approvedCount = requests.filter(
          (req) => req.status === "APPROVED"
        ).length;

        setStats({
          totalRequests: requests.length,
          pendingRequests: pendingCount,
          approvedRequests: approvedCount,
          recentActivity: requests.slice(0, 3), // แสดง 3 รายการล่าสุด
          popularProducts: products.slice(0, 4), // แสดง 4 สินค้าแรก
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Skeleton */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 space-y-6">
          {/* Hero Skeleton */}
          <div className="pt-4">
            <Skeleton className="h-32 rounded-3xl" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 rounded-3xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ku-green to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">KU</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">แดชบอร์ด</h1>
              <p className="text-xs text-gray-500">มหาวิทยาลัยเกษตรศาสตร์</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/products")}
              className="rounded-xl"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="relative rounded-xl">
              <Bell className="h-4 w-4" />
              {stats.pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {stats.pendingRequests}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-6 space-y-6">
        {/* Welcome Hero Section */}
        <div className="pt-4">
          <div className="bg-gradient-to-br from-ku-green via-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                สวัสดี, {session?.user?.name?.split(" ")[0] || "ผู้ใช้"} 👋
              </h2>
              <p className="text-green-100 mb-4 text-sm leading-relaxed">
                พร้อมเบิกครุภัณฑ์วันนี้แล้วหรือยัง?
              </p>
              <div className="flex items-center text-sm text-green-100">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {new Date().toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalRequests}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                รายการทั้งหมด
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pendingRequests}
              </div>
              <div className="text-xs text-gray-600 font-medium">รออนุมัติ</div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.approvedRequests}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                อนุมัติแล้ว
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            เริ่มต้นใช้งาน
          </h3>
          <div className="space-y-3">
            {/* Main CTA - เบิกครุภัณฑ์ */}
            <Card
              className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-xl cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => router.push("/products")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">เบิกครุภัณฑ์</h4>
                      <p className="text-blue-100 text-sm">
                        ค้นหาและเบิกอุปกรณ์ที่ต้องการ
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="bg-white/60 backdrop-blur-sm border-0 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => router.push("/cart")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-2 shadow-md relative">
                        <ShoppingCart className="w-5 h-5 text-white" />
                        {getTotalItems() > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                            {getTotalItems()}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        ตะกร้า
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {getTotalItems()} รายการ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="bg-white/60 backdrop-blur-sm border-0 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => router.push("/requests")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-md">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        ประวัติ
                      </h4>
                      <p className="text-gray-600 text-xs">ดูรายการเบิก</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">กิจกรรมล่าสุด</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/requests")}
                className="text-blue-600 hover:text-blue-700"
              >
                ดูทั้งหมด
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 3).map((activity, index) => (
                <Card
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border-0 shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          activity.status === "PENDING"
                            ? "bg-orange-100 text-orange-600"
                            : activity.status === "APPROVED"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {activity.status === "PENDING" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          คำขอ #{activity.request_number}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          {activity.status === "PENDING"
                            ? "รออนุมัติ"
                            : activity.status === "APPROVED"
                            ? "อนุมัติแล้ว"
                            : "ไม่อนุมัติ"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "PENDING"
                            ? "secondary"
                            : "default"
                        }
                        className="text-xs"
                      >
                        {activity.status === "PENDING"
                          ? "รอดำเนินการ"
                          : activity.status === "APPROVED"
                          ? "เสร็จสิ้น"
                          : "ยกเลิก"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              เริ่มต้นเบิกครุภัณฑ์
            </h3>
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  ยังไม่มีประวัติการเบิก
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  เริ่มต้นเบิกครุภัณฑ์แรกของคุณเลย!
                </p>
                <Button
                  onClick={() => router.push("/products")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  เริ่มเบิกครุภัณฑ์
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popular Products Preview */}
        {stats.popularProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                <Star className="w-5 h-5 inline mr-2 text-yellow-500" />
                สินค้าแนะนำ
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/products")}
                className="text-blue-600 hover:text-blue-700"
              >
                ดูทั้งหมด
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.popularProducts.slice(0, 4).map((product, index) => (
                <Card
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border-0 shadow-md cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => router.push("/products")}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-3 flex items-center justify-center">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      คงเหลือ {product.stock || 0} ชิ้น
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
