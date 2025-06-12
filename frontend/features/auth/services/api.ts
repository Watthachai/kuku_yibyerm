import {
  type Signin,
  type Signup,
  type AuthResponse,
  type User,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class AuthAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "เกิดข้อผิดพลาด" }));
      throw new Error(
        error.message || error.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
      );
    }

    return response.json();
  }

  async signIn(credentials: Signin): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async signUp(data: Signup): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async signOut(): Promise<void> {
    return this.request<void>("/auth/sign-out", {
      method: "POST",
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/auth/profile");
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getProfile();
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }

  async linkOAuthAccount(provider: string, code: string): Promise<User> {
    return this.request<User>(`/auth/oauth/${provider}/link`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async unlinkOAuthAccount(provider: string): Promise<User> {
    return this.request<User>(`/auth/oauth/${provider}/unlink`, {
      method: "DELETE",
    });
  }
}

export const authAPI = new AuthAPI();
