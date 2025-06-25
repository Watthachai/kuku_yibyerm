"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080";

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    redirect("/auth/sign-in");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function createRequest(formData: FormData) {
  const purpose = formData.get("purpose") as string;
  const notes = formData.get("notes") as string;
  const items = JSON.parse(formData.get("items") as string);

  const data = await apiCall("/requests", {
    method: "POST",
    body: JSON.stringify({
      purpose,
      notes,
      priority: "NORMAL",
      items: items.map((item: any) => ({
        product_id: item.productId,
        quantity: item.quantity,
        purpose: item.purpose,
        notes: item.notes,
      })),
    }),
  });

  revalidatePath("/mobile/requests");
  return data.request;
}

export async function getMyRequests(
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  return apiCall(`/requests/my?${params.toString()}`);
}

export async function getAllRequests(
  filters: {
    status?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(
        key === "departmentId" ? "department_id" : key,
        value.toString()
      );
    }
  });

  return apiCall(`/admin/requests?${params.toString()}`);
}

export async function approveRequest(requestId: string, notes?: string) {
  await apiCall(`/admin/requests/${requestId}/approve`, {
    method: "PUT",
    body: JSON.stringify({ notes: notes || "" }),
  });

  revalidatePath("/admin/requests");
}

export async function rejectRequest(requestId: string, reason: string) {
  await apiCall(`/admin/requests/${requestId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });

  revalidatePath("/admin/requests");
}
