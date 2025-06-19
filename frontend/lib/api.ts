import { getSession } from "next-auth/react";

export async function getAuthHeaders() {
  const session = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}

export async function getAuthHeadersForFormData() {
  const session = await getSession();
  // เมื่อใช้ FormData, browser จะตั้ง Content-Type เองโดยอัตโนมัติ
  // เราจึงไม่ต้องกำหนด 'Content-Type': 'application/json'
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}
