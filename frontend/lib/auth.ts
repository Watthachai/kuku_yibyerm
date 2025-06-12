import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

          const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-in`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

          const response = await fetch(
            `${API_BASE_URL}/api/v1/auth/oauth/google`,
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
                accessToken: account.access_token,
              }),
            }
          );

          if (!response.ok) {
            console.error("Failed to sync user with backend");
            return false;
          }

          const data = await response.json();

          user.accessToken = data.accessToken;
          user.refreshToken = data.refreshToken;
          user.role = data.user.role;
          user.id = data.user.id;

          return true;
        } catch (error) {
          console.error("OAuth sync error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        // แก้ไข TypeScript errors โดยใช้ type assertion
        session.user.id = (token.userId as string) || "";
        session.user.role = (token.role as string) || "";
        session.accessToken = (token.accessToken as string) || "";
        session.refreshToken = (token.refreshToken as string) || "";
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
