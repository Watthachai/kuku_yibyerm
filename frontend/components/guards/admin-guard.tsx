"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { KULoading } from "@/components/ui/ku-loading";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      redirect("/sign-in");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      redirect("/dashboard"); // Redirect to regular dashboard
      return;
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <KULoading variant="page" message="กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ..." />
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
