"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { type Role } from "@/features/auth/types";
import { useUiStore } from "@/features/ui/store";

interface ProtectedRouteProps {
  roles?: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute = ({ roles, children, fallback }: ProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setToast = useUiStore((state) => state.setToast);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setToast({ type: "Error", message: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
      router.replace("/auth/sign-in");
      return;
    }

    if (!roles) {
      setIsAllowed(true);
      return;
    }

    if (session?.user?.role && roles.includes(session.user.role as Role)) {
      setIsAllowed(true);
      return;
    }

    setToast({
      type: "Error",
      message: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
    });
    router.replace("/forbidden");
  }, [roles, router, session, setToast, status]);

  if (status === "loading") {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">กำลังโหลด...</div>
        </div>
      )
    );
  }

  if (isAllowed) return <>{children}</>;

  return null;
};

export default ProtectedRoute;
