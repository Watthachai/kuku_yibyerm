"use client";

import { AdminGuard } from "@/components/guards/admin-guard";
import { AdminUserManagement } from "@/features/admin/components/admin-user-management";

export default function UsersManagementPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-600">
            จัดการสิทธิ์ผู้ใช้ สถานะ และบทบาทในระบบ
          </p>
        </div>
        <AdminUserManagement />
      </div>
    </AdminGuard>
  );
}
