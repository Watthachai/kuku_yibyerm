// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { Role } from "@/features/auth/types";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        try {
          // Call backend API for authentication
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "การเข้าสู่ระบบล้มเหลว");
          }

          const data = await response.json();

          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            departmentId: data.user.department_id || "1",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          console.log("🔍 Google OAuth data:", { user, account });

          // ⭐ แก้ไข URL ให้ถูกต้อง
          const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
          const response = await fetch(
            `${backendUrl}/api/v1/auth/oauth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                avatar: user.image,
                providerId: user.id,
                accessToken: account.access_token || "",
              }),
            }
          );

          console.log("📡 Backend response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Google OAuth backend error:", errorText);
            return false;
          }

          const data = await response.json();
          console.log("✅ Backend response:", data);

          // Store additional user data
          user.role = data.user.role || Role.USER;
          user.departmentId = data.user.department_id || "1";
          user.accessToken = data.access_token; // ⭐ สำคัญ!
          user.refreshToken = data.refresh_token; // ⭐ สำคัญ!

          return true;
        } catch (error) {
          console.error("❌ Google OAuth error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // ⭐ เพิ่ม account parameter
      console.log("🔍 JWT callback:", { token, user, account });

      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.id;
        token.departmentId = user.departmentId;
      }

      // Store Google access token if available
      if (account?.access_token) {
        token.googleAccessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("🔍 Session callback:", { session, token });

      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.departmentId = token.departmentId;
        session.accessToken = token.accessToken; // ⭐ สำคัญ!
        session.refreshToken = token.refreshToken; // ⭐ สำคัญ!
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // ⭐ เพิ่ม debug
};
