"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SessionGuardProps {
  children: React.ReactNode;
  redirectTo: string;
  whenAuthenticated?: boolean;
  whenUnauthenticated?: boolean;
}

export function SessionGuard({
  children,
  redirectTo,
  whenAuthenticated = false,
  whenUnauthenticated = false,
}: SessionGuardProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (whenAuthenticated && status === "authenticated") {
      router.push(redirectTo);
      return;
    }

    if (whenUnauthenticated && status === "unauthenticated") {
      router.push(redirectTo);
      return;
    }
  }, [status, router, redirectTo, whenAuthenticated, whenUnauthenticated]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ku-green via-green-600 to-ku-green-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
}
