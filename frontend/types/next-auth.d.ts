import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      departmentId: string;
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken?: string;
  }

  interface User extends DefaultUser {
    role: string;
    departmentId: string;
    accessToken: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    accessToken: string;
    refreshToken?: string;
    userId: string;
    departmentId: string;
  }
}
