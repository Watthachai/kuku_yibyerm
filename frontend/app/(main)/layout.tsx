"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileLayout } from "@/features/mobile/components/layouts/mobile-layout";
import { KULoading } from "@/components/ui/ku-loading";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return <KULoading variant="page" message="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  }

  if (status === "unauthenticated") {
    redirect("/sign-in");
  }

  const userRole = session?.user?.role;

  // USER role -> Mobile UI
  if (userRole === "USER") {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // ADMIN role -> Desktop UI with Responsive Design
  if (userRole === "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          session={session}
          onRefreshSession={update}
        />

        <div className="lg:pl-64">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onRefreshSession={update}
          />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    );
  }

  // Fallback
  redirect("/sign-in");
}
