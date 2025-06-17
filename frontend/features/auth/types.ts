export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  department?: Department;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  lastLogin?: string;
}

export interface Signin {
  email: string;
  password: string;
}

export interface Signup {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  departmentId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// ลบ APPROVER ออก - เหลือแค่ ADMIN และ USER
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  building?: string;
  contact?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GoogleOAuthData {
  email: string;
  name: string;
  picture?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
