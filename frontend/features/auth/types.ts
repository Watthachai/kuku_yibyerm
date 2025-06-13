export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  provider?: "local" | "google";
  providerId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface Signin {
  email: string;
  password: string;
}

export interface Signup {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export enum Role {
  ADMIN = "ADMIN",
  APPROVER = "APPROVER", // เปลี่ยนจาก STAFF เป็น APPROVER
  USER = "USER",
}

export interface OAuthProvider {
  id: "google" | "microsoft";
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  textColor: string;
}

// Department interface for KU Asset system
export interface Department {
  id: string;
  name: string;
  faculty: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth validation schemas
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleOAuthData {
  email: string;
  name: string;
  avatar?: string;
  providerId: string;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}
