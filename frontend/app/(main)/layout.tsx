"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileLayout } from "@/features/mobile/components/layouts/mobile-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ku-green"></div>
          <p className="text-sm text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/sign-in");
  }

  const userRole = session?.user?.role;

  // USER role -> Mobile UI
  if (userRole === "USER") {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }

  // ADMIN role -> Desktop UI with Responsive Design
  if (userRole === "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50">
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