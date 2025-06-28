// lib/config.ts
export const CONFIG = {
  // ⭐ Backend URLs with fallbacks
  BACKEND_URL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8080",

  API_BASE_URL:
    (process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:8080") + "/api/v1",

  // ⭐ NextAuth URLs
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // ⭐ Frontend URL
  FRONTEND_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",

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
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
}

// ⭐ Check if we're running in browser
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
