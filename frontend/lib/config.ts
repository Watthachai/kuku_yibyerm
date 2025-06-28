// lib/config.ts
export const CONFIG = {
  // ⭐ Backend URLs - ใช้ environment variables เท่านั้น
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === "development" // เช็ค development แทน
      ? "http://localhost:8080"
      : undefined),

  API_BASE_URL: (() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : undefined);
    return backendUrl ? `${backendUrl}/api/v1` : undefined;
  })(),

  // ⭐ NextAuth URLs
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,

  // ⭐ Frontend URL
  FRONTEND_URL: process.env.NEXT_PUBLIC_API_URL,

  // ⭐ Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// ⭐ Validate required environment variables
export function validateConfig() {
  const requiredVars = [
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  // ⭐ ใน Production ต้องมี NEXT_PUBLIC_BACKEND_URL
  if (CONFIG.IS_PRODUCTION && !process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.error("❌ NEXT_PUBLIC_BACKEND_URL is required in production!");
    requiredVars.push("NEXT_PUBLIC_BACKEND_URL");
  }

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.warn("⚠️ Missing environment variables:", missing.join(", "));
  }

  // Log configuration in development
  if (CONFIG.IS_DEVELOPMENT) {
    console.log("🔧 Configuration:", {
      BACKEND_URL: CONFIG.BACKEND_URL,
      API_BASE_URL: CONFIG.API_BASE_URL,
      NEXTAUTH_URL: CONFIG.NEXTAUTH_URL,
      FRONTEND_URL: CONFIG.FRONTEND_URL,
    });
  }

  return missing.length === 0;
}

// ⭐ Get API URL with fallback
export function getApiUrl(endpoint: string = ""): string {
  const baseUrl = CONFIG.API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "❌ Backend URL not configured! Check environment variables."
    );
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
}

// ⭐ Check if we're running in browser
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
