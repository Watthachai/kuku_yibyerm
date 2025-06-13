// lib/auth-utils.ts
import type { Session } from "next-auth";
import { Role } from "@/features/auth/types";

export const validateKUEmail = (email: string): boolean => {
  return email.endsWith("@ku.ac.th") || email.endsWith("@ku.th");
};

export const hasRole = (session: Session | null, role: Role): boolean => {
  return session?.user?.role === role;
};

export const hasAnyRole = (session: Session | null, roles: Role[]): boolean => {
  return !!session?.user?.role && roles.includes(session.user.role as Role);
};

export const isAdmin = (session: Session | null): boolean => {
  return hasRole(session, Role.ADMIN);
};

export const isApprover = (session: Session | null): boolean => {
  return hasRole(session, Role.APPROVER);
};

export const canAccessAdminRoutes = (session: Session | null): boolean => {
  return hasAnyRole(session, [Role.ADMIN]);
};

export const canAccessApproverRoutes = (session: Session | null): boolean => {
  return hasAnyRole(session, [Role.ADMIN, Role.APPROVER]);
};

export const getUserDisplayName = (session: Session | null): string => {
  return session?.user?.name || session?.user?.email || "ผู้ใช้งาน";
};

export const getRoleDisplayName = (role?: string): string => {
  switch (role) {
    case Role.ADMIN:
      return "ผู้ดูแลระบบ";
    case Role.APPROVER:
      return "หัวหน้าภาควิชา";
    case Role.USER:
      return "ผู้ใช้งาน";
    default:
      return "ผู้ใช้งาน";
  }
};

export const getDepartmentDisplayName = (departmentId?: string): string => {
  // This would typically come from a lookup table or API
  switch (departmentId) {
    case "1":
      return "คณะเกษตร";
    case "2":
      return "คณะวิศวกรรมศาสตร์";
    case "3":
      return "คณะสัตวแพทยศาสตร์";
    default:
      return "ไม่ระบุหน่วยงาน";
  }
};

// Session validation hooks
export const useAuthGuard = (requiredRoles?: Role[]) => {
  return (session: Session | null): boolean => {
    if (!session) return false;
    if (!requiredRoles) return true;
    return hasAnyRole(session, requiredRoles);
  };
};

// Token utilities
export const isTokenExpired = (token?: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const getTokenPayload = (
  token?: string
): Record<string, unknown> | null => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};
