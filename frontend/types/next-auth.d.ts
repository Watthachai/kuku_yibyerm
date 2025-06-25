// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { Role } from "@/features/auth/types"; // Import Role enum ของคุณ

// ขยายความ Interface ของ JWT (token)
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: Role;
    accessToken: string;
    refreshToken: string;
    userId: string;
    departmentId?: string;
  }
}

// ขยายความ Interface ของ Session และ User
declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      role: Role;
      departmentId?: string;
    } & DefaultSession["user"]; // นำ field เดิม (name, email, image) มารวมด้วย
  }

  interface User extends DefaultUser {
    role: Role;
    accessToken: string;
    refreshToken: string;
    departmentId?: string;
  }
}
