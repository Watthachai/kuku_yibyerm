"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Building,
  Settings,
  LogOut,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

export function UserProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userStats] = useState({
    totalRequests: 15,
    pendingRequests: 2,
    borrowedItems: 3,
    completedRequests: 10,
  });

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/sign-in",
      });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      router.replace("/sign-in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">โปรไฟล์</h1>
          <p className="text-sm text-gray-600">
            จัดการข้อมูลส่วนตัวและการตั้งค่า
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-ku-green to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {session?.user?.name || "ผู้ใช้"}
                </h2>
                <p className="text-gray-600 mb-2">{session?.user?.email}</p>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                  ผู้ใช้งานระบบ
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {session?.user?.email}
                </span>
              </div>
              <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50">
                <Building className="w-5 h-5 mr-3 text-purple-600" />
                <span className="text-sm text-gray-700 font-medium">
                  คณะเกษตร
                </span>
              </div>
              <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50">
                <Phone className="w-5 h-5 mr-3 text-green-600" />
                <span className="text-sm text-gray-700 font-medium">
                  02-123-4567
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              สถิติการใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.borrowedItems}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  กำลังยืม
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-100/50 backdrop-blur-sm">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.pendingRequests}
                </div>
                <div className="text-sm text-orange-600 font-medium">
                  รออนุมัติ
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-100/50 backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {userStats.completedRequests}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  เสร็จสิ้น
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100/50 backdrop-blur-sm">
                <Package className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-600">
                  {userStats.totalRequests}
                </div>
                <div className="text-sm text-gray-600 font-medium">ทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">
              การตั้งค่า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all duration-200"
              onClick={() => console.log("Edit profile")}
            >
              <User className="w-5 h-5 mr-3 text-blue-600" />
              แก้ไขข้อมูลส่วนตัว
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-all duration-200"
              onClick={() => console.log("Settings")}
            >
              <Settings className="w-5 h-5 mr-3 text-purple-600" />
              การตั้งค่าทั่วไป
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-red-50/60 backdrop-blur-sm border-red-200/50 text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              ออกจากระบบ
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card className="bg-white/40 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold">KU Asset Management System</p>
              <p>เวอร์ชัน 1.0.0</p>
              <p>© 2023 มหาวิทยาลัยเกษตรศาสตร์</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
