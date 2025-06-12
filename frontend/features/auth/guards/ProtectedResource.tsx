"use client";

import { type Role } from "../types";
import { useAuth } from "../providers/AuthProvider";
import { type ReactNode } from "react";

interface ProtectedResourceProps {
  roles?: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedResource = ({
  roles,
  children,
  fallback,
}: ProtectedResourceProps) => {
  const { isAuthenticated, isLoading, session } = useAuth();

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (roles && session && !roles.includes(session.user.role as Role)) {
    return fallback || null;
  }

  return <>{children}</>;
};

export default ProtectedResource;
