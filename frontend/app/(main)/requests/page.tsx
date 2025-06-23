"use client";

import { useSession } from "next-auth/react";
import { MyRequests } from "@/features/mobile/components/requests/my-requests";
import { RequestManagement } from "@/features/admin/components/requests/request-management";
import { Loader2 } from "lucide-react";

export default function RequestsPage() {
  const { data: session, status } = useSession();

  console.log("RequestsPage - Session status:", status);
  console.log("RequestsPage - Session data:", session);
  console.log("RequestsPage - User role:", session?.user?.role);

  // Loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">กรุณาเข้าสู่ระบบ</p>
      </div>
    );
  }

  // ⭐ Role-based rendering ใช้ session แทน useAuth
  const userRole = session.user.role;
  console.log("🔍 User role:", userRole);

  return (
    <>
      {userRole === "ADMIN" && <RequestManagement />}
      {userRole === "USER" && <MyRequests />}
      {!userRole && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ไม่พบสิทธิ์การใช้งาน
            </h2>
            <p className="text-gray-600">กรุณาติดต่อผู้ดูแลระบบ</p>
            <p className="text-sm text-gray-500 mt-2">
              Role: {userRole || "undefined"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
