"use client";

import { useSession } from "next-auth/react";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { MobileDashboard } from "@/features/mobile/components/dashboard/mobile-dashboard";
//import { SessionDebug } from "@/components/debug/session-debug";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  
  console.log("DashboardPage - Session status:", status);
  console.log("DashboardPage - Session data:", session);
  console.log("DashboardPage - User role:", session?.user?.role);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ku-green"></div>
      </div>
    );
  }

  const userRole = session?.user?.role;
  console.log("DashboardPage - Rendering for role:", userRole);

  return (
    <>
      {userRole === "ADMIN" && <AdminDashboard />}
      {userRole === "USER" && <MobileDashboard />}
      {!userRole && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบสิทธิ์การใช้งาน</h2>
            <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบ</p>
            <p className="text-sm text-gray-500 mt-2">Role: {userRole || "undefined"}</p>
          </div>
        </div>
      )}
      {/* <SessionDebug /> */}
    </>
  );
}
