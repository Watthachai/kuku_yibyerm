// lib/config.ts

// ⭐ Get backend URL with proper client/server handling
function getBackendUrl(): string {
  // On client-side, only NEXT_PUBLIC_* variables are available
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://backend-go-production-2ba8.up.railway.app" // ⭐ Production fallback for client
    );
  }

  // On server-side, both variables are available
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "https://backend-go-production-2ba8.up.railway.app")
  );
}

export const CONFIG = {
  // ⭐ Backend URLs with client/server awareness
  BACKEND_URL: getBackendUrl(),
  API_BASE_URL: `${getBackendUrl()}/api/v1`,

  // ⭐ NextAuth URLs
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,

  // ⭐ Frontend URL
  FRONTEND_URL: process.env.NEXT_PUBLIC_API_URL,

  // ⭐ Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// ⭐ Debug configuration in browser
if (typeof window !== "undefined") {
  console.log("🌐 CLIENT CONFIG DEBUG:", {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
    COMPUTED_BACKEND_URL: CONFIG.BACKEND_URL,
    COMPUTED_API_BASE_URL: CONFIG.API_BASE_URL,
  });
}

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
