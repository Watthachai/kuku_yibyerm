import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";

export interface OAuthSignInOptions {
  provider: "google";
  callbackUrl?: string;
  redirect?: boolean;
}

export interface OAuthSignInResult {
  success: boolean;
  error?: string;
  url?: string;
}

export class OAuthService {
  /**
   * Initiate OAuth sign-in process
   */
  static async signIn(options: OAuthSignInOptions): Promise<OAuthSignInResult> {
    try {
      const result: SignInResponse | undefined = await signIn(
        options.provider,
        {
          callbackUrl: options.callbackUrl || "/dashboard",
          redirect: options.redirect ?? true,
        }
      );

      if (result?.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        url: result?.url || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OAuth sign-in failed",
      };
    }
  }

  /**
   * Get available OAuth providers
   */
  static getAvailableProviders() {
    return [
      {
        id: "google",
        name: "Google",
        displayName: "เข้าสู่ระบบด้วย Google",
      },
    ] as const;
  }
}
