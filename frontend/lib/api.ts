import { getSession, signOut } from "next-auth/react";
import { Session } from "next-auth";

// ⭐ Session Cache ป้องกันการเรียก getSession() บ่อยเกินไป
let sessionCache: { session: Session | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 30000; // 30 วินาที

async function getCachedSession() {
  const now = Date.now();

  // ถ้ามี cache และยังไม่หมดอายุ
  if (sessionCache && now - sessionCache.timestamp < SESSION_CACHE_DURATION) {
    return sessionCache.session;
  }

  // ดึง session ใหม่และ cache ไว้
  const session = await getSession();
  sessionCache = { session, timestamp: now };

  return session;
}

// ⭐ ตรวจสอบว่า token ใกล้หมดอายุหรือไม่
function isTokenExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = exp - now;

    // ถ้าเหลืออีก 1 ชั่วโมง (3600000 ms) ให้ refresh
    return timeUntilExpiry < 3600000;
  } catch {
    return true; // ถ้า parse ไม่ได้ ให้ถือว่าหมดอายุ
  }
}

// ⭐ ฟังก์ชัน refresh token
async function refreshToken(): Promise<string | null> {
  try {
    const session = await getCachedSession();
    if (!session?.refreshToken) {
      return null;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    const response = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.refreshToken}`,
      },
    });

    if (!response.ok) {
      // ถ้า refresh ไม่ได้ ให้ logout
      await signOut({ redirect: false });
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    await signOut({ redirect: false });
    return null;
  }
}

export async function getAuthHeaders() {
  const session = await getCachedSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    // ⭐ ตรวจสอบและ refresh token ถ้าจำเป็น
    if (isTokenExpiringSoon(session.accessToken)) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
      } else {
        // ถ้า refresh ไม่ได้ ให้ redirect ไป login
        window.location.href = "/auth/signin";
        return headers;
      }
    } else {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return headers;
}

export async function getAuthHeadersForFormData() {
  const session = await getCachedSession();
  // เมื่อใช้ FormData, browser จะตั้ง Content-Type เองโดยอัตโนมัติ
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    // ⭐ ตรวจสอบและ refresh token ถ้าจำเป็น
    if (isTokenExpiringSoon(session.accessToken)) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
      } else {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
        return headers;
      }
    } else {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return headers;
}
