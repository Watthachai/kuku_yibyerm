"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  Building,
  Settings,
  LogOut,
  Package,
  Loader2,
  Star,
  Bell,
  Shield,
  QrCode,
  Camera,
  MapPin,
  Globe,
  Eye,
  Moon,
  Sun,
  Zap,
  FileText,
  History,
  ChevronRight,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  userService,
  type UserProfile as UserProfileType,
  UserStats,
} from "../../services/user-service";
import { EditProfileModal } from "./edit-profile-modal";

export function UserProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    borrowedItems: 0,
    completedRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const [profile, stats] = await Promise.all([
          userService.getCurrentUser(),
          userService.getUserStats(),
        ]);

        setUserProfile(profile);
        setUserStats(stats);

        // Debug: ตรวจสอบข้อมูล department ที่ได้มา
        console.log("🔍 User Profile Data:", profile);
        console.log("🏢 Department Data:", profile.department);
        console.log(
          "� Department ID:",
          profile.department?.id,
          "Type:",
          typeof profile.department?.id
        );
        console.log("👥 Parent ID:", profile.department?.parent_id);
        console.log("🏛️ Faculty:", profile.department?.faculty);
        console.log("📁 Department Type:", profile.department?.type);

        // ตรวจสอบว่าเป็นคณะหรือภาควิชา
        if (profile.department) {
          const deptId = parseInt(profile.department.id);
          console.log("🔢 Department ID (number):", deptId);
          console.log("🏫 Is Faculty (ID 1-11):", deptId >= 1 && deptId <= 11);
          console.log("🏢 Is Department (ID 12+):", deptId >= 12);
        }

        // Calculate profile completion
        const completion = calculateProfileCompletion(profile);
        setProfileCompletion(completion);
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [session]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: UserProfileType): number => {
    let completed = 0;
    const total = 5;

    if (profile.name) completed++;
    if (profile.email) completed++;
    if (profile.phone) completed++;
    if (profile.department_id) completed++;
    if (profile.avatar) completed++;

    return Math.round((completed / total) * 100);
  };

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    setUserProfile(updatedProfile);
    const completion = calculateProfileCompletion(updatedProfile);
    setProfileCompletion(completion);
    toast.success("อัปเดตโปรไฟล์สำเร็จ");
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">โปรไฟล์</h1>
                <p className="text-sm text-gray-600">
                  จัดการข้อมูลส่วนตัวและการตั้งค่า
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              กำลังโหลดข้อมูล...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              กำลังดึงข้อมูลจาก API...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayUser = userProfile || {
    name: session?.user?.name || "ผู้ใช้",
    email: session?.user?.email || "",
    avatar: session?.user?.image,
    phone: "",
    department: null,
    role: "USER" as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Actions */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">โปรไฟล์</h1>
              <p className="text-sm text-gray-600">
                จัดการข้อมูลส่วนตัวและการตั้งค่า
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-9 h-9 p-0 bg-white/60 hover:bg-white/80"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-9 h-9 p-0 bg-white/60 hover:bg-white/80"
                onClick={() => toast.info("QR Code สำหรับโปรไฟล์")}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-6">
          {/* Hero Profile Section */}
          <div className="bg-gradient-to-br from-ku-green/10 via-blue-50 to-indigo-50 shadow-xl overflow-hidden rounded-2xl">
            {/* Cover Background */}
            <div className="h-24 bg-gradient-to-r from-ku-green to-emerald-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="px-6 pb-6 -mt-12 relative">
              {/* Avatar Section - Centered */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white/80 bg-white">
                    {displayUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayUser.avatar}
                        alt={displayUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ku-green to-emerald-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full bg-white shadow-lg hover:bg-gray-50"
                    variant="outline"
                    onClick={() => toast.info("เปลี่ยนรูปโปรไฟล์")}
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>

                {/* User Info - Centered */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {displayUser.name}
                  </h2>
                  <p className="text-gray-600 mb-4 break-all">
                    {displayUser.email}
                  </p>

                  <div className="flex items-center justify-center space-x-3">
                    <Badge
                      className={`border-0 shadow-lg ${
                        displayUser.role === "ADMIN"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      }`}
                    >
                      {displayUser.role === "ADMIN"
                        ? "ผู้ดูแลระบบ"
                        : "ผู้ใช้งานระบบ"}
                    </Badge>

                    {profileCompletion === 100 && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        โปรไฟล์สมบูรณ์
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Completion Progress */}
              {profileCompletion < 100 && (
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      ความสมบูรณ์ของโปรไฟล์
                    </span>
                    <span className="text-sm font-bold text-ku-green">
                      {profileCompletion}%
                    </span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  <p className="text-xs text-gray-600 mt-2">
                    เติมข้อมูลให้ครบเพื่อใช้งานระบบได้อย่างเต็มประสิทธิภาพ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/60 backdrop-blur-sm shadow-xl rounded-2xl">
            <div className="px-6 pt-6">
              <div className="text-lg font-bold text-gray-900 flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  ข้อมูลติดต่อ
                </div>
                {"is_active" in displayUser && (
                  <Badge
                    variant={displayUser.is_active ? "default" : "destructive"}
                    className={`text-xs px-3 py-1 ${
                      displayUser.is_active
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {displayUser.is_active ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="px-6 pb-6 space-y-4">
              {/* อีเมล */}
              <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-200">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium break-all">
                      {displayUser.email}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 text-blue-600 border-blue-200 ml-2"
                    >
                      อีเมล
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    <span className="text-xs text-green-600">
                      ยืนยันแล้ว • ผ่าน{" "}
                      {"provider" in displayUser
                        ? displayUser.provider || "อีเมล"
                        : "อีเมล"}
                    </span>
                  </div>
                </div>
              </div>{" "}
              {/* คณะและภาควิชา/หน่วยงาน */}
              {displayUser.department ? (
                <div className="flex items-start p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-200">
                  <Building className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    {/* ตรวจสอบว่าเป็นคณะ (Type FACULTY) หรือภาควิชา (Type DIVISION) */}
                    {displayUser.department.type === "FACULTY" ? (
                      // แสดงเฉพาะคณะ
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-bold">
                          {displayUser.department.name}
                        </span>
                        <Badge
                          variant="default"
                          className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200"
                        >
                          คณะ
                        </Badge>
                      </div>
                    ) : (
                      // แสดงทั้งคณะและภาควิชา
                      <>
                        {/* แสดงคณะจาก faculty */}
                        {displayUser.department.faculty && (
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700 font-bold">
                              {displayUser.department.faculty}
                            </span>
                            <Badge
                              variant="default"
                              className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 border-purple-200"
                            >
                              คณะ
                            </Badge>
                          </div>
                        )}

                        {/* แสดงภาควิชา/หน่วยงาน */}
                        <div className="flex items-center mt-1.5 mb-2">
                          <div className="w-4 h-px bg-gray-300 mr-2"></div>
                          <span className="text-xs text-gray-600 font-medium">
                            {displayUser.department.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 ml-2 text-purple-600 border-purple-200"
                          >
                            {displayUser.department.type === "DIVISION"
                              ? "ภาควิชา"
                              : "หน่วยงาน"}
                          </Badge>
                        </div>
                      </>
                    )}

                    {displayUser.department.building && (
                      <div className="flex items-center mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          อาคาร {displayUser.department.building}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 bg-amber-50/60 backdrop-blur-sm rounded-xl border border-amber-200/50 hover:bg-amber-50/80 transition-all duration-200">
                  <Building className="w-5 h-5 mr-3 text-amber-600" />
                  <div className="flex-1">
                    <span className="text-sm text-amber-700 font-medium">
                      ยังไม่ได้ระบุคณะและภาควิชา
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-amber-600">
                        กรุณาเลือกคณะและภาควิชาในการแก้ไขโปรไฟล์
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* เบอร์โทรศัพท์ */}
              {displayUser.phone ? (
                <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-200">
                  <Phone className="w-5 h-5 mr-3 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">
                        {displayUser.phone}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 text-green-600 border-green-200"
                      >
                        โทรศัพท์
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-gray-50/80 transition-all duration-200">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-500 font-medium">
                      ยังไม่ได้ระบุเบอร์โทรศัพท์
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-400">
                        เพิ่มเบอร์โทรศัพท์ในการแก้ไขโปรไฟล์
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* สิทธิ์การใช้งาน */}
              <div className="flex items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-200">
                <Shield className="w-5 h-5 mr-3 text-indigo-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">
                      {displayUser.role === "ADMIN"
                        ? "ผู้ดูแลระบบ"
                        : "ผู้ใช้งานทั่วไป"}
                    </span>
                    <Badge
                      variant={
                        displayUser.role === "ADMIN" ? "default" : "secondary"
                      }
                      className={`text-xs px-2 py-0.5 ${
                        displayUser.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {displayUser.role === "ADMIN" ? "แอดมิน" : "ผู้ใช้งาน"}
                    </Badge>
                  </div>
                  {"last_login_at" in displayUser &&
                    displayUser.last_login_at && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          เข้าใช้ครั้งล่าสุด:{" "}
                          {new Date(
                            displayUser.last_login_at
                          ).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Enhanced */}
          <div className="bg-white/60 backdrop-blur-sm shadow-xl rounded-2xl">
            <div className="px-6 pt-6">
              <div className="text-lg font-bold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                การดำเนินการ
              </div>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {/* Edit Profile Button with Modal */}
              {userProfile && (
                <EditProfileModal
                  user={userProfile}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}

              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-blue-50/80 hover:border-blue-200 transition-all duration-200 group"
                onClick={() => router.push("/requests")}
              >
                <FileText className="w-5 h-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">ดูคำขอของฉัน</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {userStats.totalRequests}
                </Badge>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-green-50/80 hover:border-green-200 transition-all duration-200 group"
                onClick={() => router.push("/products")}
              >
                <Package className="w-5 h-5 mr-3 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">เบิกครุภัณฑ์ใหม่</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-purple-50/80 hover:border-purple-200 transition-all duration-200 group"
                onClick={() => router.push("/history")}
              >
                <History className="w-5 h-5 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">ประวัติการใช้งาน</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </Button>

              <Separator className="my-4" />

              {/* Settings Section */}
              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-indigo-50/80 hover:border-indigo-200 transition-all duration-200 group"
                onClick={() => toast.info("การแจ้งเตือน")}
              >
                <Bell className="w-5 h-5 mr-3 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">การแจ้งเตือน</span>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 hover:border-gray-300 transition-all duration-200 group"
                onClick={() => toast.info("ความปลอดภัยและความเป็นส่วนตัว")}
              >
                <Shield className="w-5 h-5 mr-3 text-gray-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">ความปลอดภัย</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 hover:border-gray-300 transition-all duration-200 group"
                onClick={() => toast.info("การตั้งค่าทั่วไป")}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-600 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">การตั้งค่าทั่วไป</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-red-50/60 backdrop-blur-sm border-red-200/50 text-red-600 hover:text-red-700 hover:bg-red-50/80 hover:border-red-300 transition-all duration-200 group"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                ออกจากระบบ
              </Button>
            </div>
          </div>

          {/* App Info & Version */}
          <div className="bg-white/40 backdrop-blur-sm shadow-lg rounded-2xl">
            <div className="p-6 text-center">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ku-green to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">KU</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    Asset Management System
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <span>เวอร์ชัน 1.0.0-beta</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>API Connected</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-gray-500">
                  © 2025 made with ❤️ for มหาวิทยาลัยเกษตรศาสตร์
                </p>
                <div className="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-gray-200/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    เว็บไซต์
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    ติดต่อ
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    นโยบาย
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
