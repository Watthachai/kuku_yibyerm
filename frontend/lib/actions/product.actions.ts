"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONFIG } from "@/lib/config";

const API_BASE_URL = CONFIG.BACKEND_URL;

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

export async function getProducts(
  filters: {
    categoryId?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(
        key === "categoryId" ? "category_id" : key,
        value.toString()
      );
    }
  });

  return apiCall(`/products?${params.toString()}`);
}

export async function getProduct(id: string) {
  const data = await apiCall(`/products/${id}`);
  return data.product;
}

export async function getCategories() {
  const data = await apiCall("/categories");
  return data.categories;
}
