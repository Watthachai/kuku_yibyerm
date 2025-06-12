import { useState } from "react";
import {
  OAuthService,
  type OAuthSignInOptions,
  type OAuthSignInResult,
} from "../services/oauth";
import { useUiStore } from "@/features/ui/store";

export interface UseOAuthReturn {
  signIn: (
    provider: "google",
    options?: Partial<OAuthSignInOptions>
  ) => Promise<OAuthSignInResult>;
  isLoading: boolean;
  error: string | null;
}

export function useOAuth(): UseOAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToast = useUiStore((state) => state.setToast);

  const signIn = async (
    provider: "google",
    options: Partial<OAuthSignInOptions> = {}
  ): Promise<OAuthSignInResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await OAuthService.signIn({
        provider,
        ...options,
      });

      if (!result.success) {
        setError(result.error || "OAuth sign-in failed");
        setToast({
          type: "Error",
          message: result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        });
      } else {
        setToast({
          type: "Success",
          message: "กำลังเข้าสู่ระบบ...",
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "OAuth sign-in failed";
      setError(errorMessage);
      setToast({
        type: "Error",
        message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    error,
  };
}
