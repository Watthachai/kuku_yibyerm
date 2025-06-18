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
  CheckCircle
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">โปรไฟล์</h1>
        <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
      </div>

      <div className="px-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-ku-green rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {session?.user?.name || 'ผู้ใช้'}
                </h2>
                <p className="text-gray-600">{session?.user?.email}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  ผู้ใช้งานระบบ
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                <span>{session?.user?.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-3" />
                <span>คณะเกษตร</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                <span>02-123-4567</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สถิติการใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.borrowedItems}
                </div>
                <div className="text-sm text-blue-600">กำลังยืม</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.pendingRequests}
                </div>
                <div className="text-sm text-orange-600">รออนุมัติ</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {userStats.completedRequests}
                </div>
                <div className="text-sm text-green-600">เสร็จสิ้น</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-600">
                  {userStats.totalRequests}
                </div>
                <div className="text-sm text-gray-600">ทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">การตั้งค่า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => console.log("Edit profile")}
            >
              <User className="w-4 h-4 mr-3" />
              แก้ไขข้อมูลส่วนตัว
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => console.log("Settings")}
            >
              <Settings className="w-4 h-4 mr-3" />
              การตั้งค่าทั่วไป
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              ออกจากระบบ
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500 pb-8">
          <p>KU Asset Management System</p>
          <p>เวอร์ชัน 1.0.0</p>
          <p>© 2023 มหาวิทยาลัยเกษตรศาสตร์</p>
        </div>
      </div>
    </div>
  );
}