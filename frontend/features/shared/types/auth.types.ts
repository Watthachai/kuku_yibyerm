export enum Role {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: Department;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  building?: string;
  contact?: string;
}

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}