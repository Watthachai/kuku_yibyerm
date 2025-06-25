import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { AdminGuard } from "@/components/guards/admin-guard";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
