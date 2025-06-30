// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { Role } from "@/features/auth/types";
import { CONFIG } from "@/lib/config";

export const authOptions: NextAuthOptions = {
  providers: [
    // --- Google Provider ---
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

    // --- Credentials Provider (Email/Password) ---
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
          const response = await fetch(
            `${CONFIG.BACKEND_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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

          // ⭐ ถูกต้อง: คาดหวังข้อมูลแบบเรียบจาก /login
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
    // --- signIn Callback ---
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const backendUrl = CONFIG.BACKEND_URL;
          const response = await fetch(
            `${backendUrl}/api/v1/auth/oauth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                avatar: user.image,
                providerId: user.id,
                accessToken: account.access_token || "",
              }),
            }
          );

          if (!response.ok) {
            console.error(
              "❌ Google OAuth backend error:",
              await response.text()
            );
            return false;
          }

          const data = await response.json();

          // ⭐ ถูกต้อง: อ่านข้อมูลแบบเรียบจาก /oauth/google
          user.role = data.user.role || Role.USER;
          user.departmentId = data.user.department_id || "1";
          user.accessToken = data.access_token;
          user.refreshToken = data.refresh_token;

          return true;
        } catch (error) {
          console.error("❌ Google OAuth error:", error);
          return false;
        }
      }
      return true;
    },

    // --- jwt Callback ---
    async jwt({ token, user }) {
      // ⭐ ถูกต้อง: ส่งต่อข้อมูลจาก user object ไปยัง token
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.id;
        token.departmentId = user.departmentId;
      }
      return token;
    },

    // --- session Callback ---
    async session({ session, token }) {
      // ⭐ ถูกต้อง: ส่งต่อข้อมูลจาก token ไปยัง session
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as Role;
        session.user.departmentId = token.departmentId as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
