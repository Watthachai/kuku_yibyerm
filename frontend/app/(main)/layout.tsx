"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { redirect } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Function สำหรับ refresh session
  const refreshSession = async () => {
    await update();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ku-green"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session} // ส่ง session ไป
        onRefreshSession={refreshSession} // ส่ง refresh function ไป
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onRefreshSession={refreshSession} // ส่งไป Header ด้วย
        />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
