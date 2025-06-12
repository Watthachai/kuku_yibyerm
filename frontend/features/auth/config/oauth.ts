import { Chrome, Building2 } from "lucide-react";
import { type OAuthProvider } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const oauthProviders: OAuthProvider[] = [
  {
    id: "google",
    name: "Google",
    icon: Chrome,
    color: "border-red-200 hover:border-red-300 hover:bg-red-50",
    bgColor: "bg-white",
    textColor: "text-gray-700",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: Building2,
    color: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    bgColor: "bg-white",
    textColor: "text-gray-700",
  },
];

export const generateOAuthState = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const storeOAuthState = (state: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("oauth_state", state);
  }
};

export const getStoredOAuthState = (): string | null => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("oauth_state");
  }
  return null;
};

export const clearOAuthState = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("oauth_state");
  }
};

export const buildOAuthUrl = (provider: OAuthProvider): string => {
  const state = generateOAuthState();
  storeOAuthState(state);

  const redirectUri = `${window.location.origin}/auth/oauth/callback`;
  const params = new URLSearchParams({
    provider: provider.id,
    redirect_uri: redirectUri,
    state,
  });

  return `${API_BASE_URL}/api/v1/auth/oauth/${
    provider.id
  }?${params.toString()}`;
};
