import { getAuthHeaders } from "@/lib/api";

export interface CreateRequestData {
  purpose: string;
  notes: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface RequestResponse {
  id: number;
  request_number: string;
  status: string;
  purpose: string;
  notes?: string;
  request_date: string;
  created_at: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  items: Array<{
    quantity: number;
    product: {
      id: number;
      name: string;
      quantity: number;
    };
  }>;
}

export class RequestService {
  private static baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  static async createRequest(
    data: CreateRequestData
  ): Promise<RequestResponse> {
    try {
      console.log("🔍 Creating request with data:", data);
      console.log("🔍 Backend URL:", this.baseUrl);

      const headers = await getAuthHeaders();
      console.log("🔍 Request headers:", headers);

      const response = await fetch(`${this.baseUrl}/api/v1/requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", Object.fromEntries(response.headers));

      const responseText = await response.text();
      console.log("🔍 Response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP ${response.status}` };
        }

        console.error("❌ Request failed:", errorData);
        throw new Error(
          errorData.message || errorData.error || "ไม่สามารถส่งคำขอได้"
        );
      }

      const responseData = JSON.parse(responseText);
      console.log("✅ Request success:", responseData);
      return responseData.data;
    } catch (error) {
      console.error("💥 Request service error:", error);
      throw error;
    }
  }

  static async getMyRequests(): Promise<RequestResponse[]> {
    try {
      console.log("🔍 Getting my requests");

      const headers = await getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/v1/requests/my`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("✅ My requests response:", responseData);

      // ⭐ แก้ไขตรงนี้ - ดึงข้อมูลจาก requests property
      if (responseData.data && responseData.data.requests) {
        console.log("✅ Returning requests array:", responseData.data.requests);
        return responseData.data.requests;
      } else if (Array.isArray(responseData.data)) {
        console.log("✅ Returning data array:", responseData.data);
        return responseData.data;
      } else {
        console.warn("⚠️ Unexpected response structure:", responseData);
        return [];
      }
    } catch (error) {
      console.error("💥 Get my requests error:", error);
      throw error;
    }
  }

  static async getRequestById(id: number): Promise<RequestResponse> {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/v1/requests/${id}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch request: ${errorText}`);
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error("💥 Get request by ID error:", error);
      throw error;
    }
  }
}
