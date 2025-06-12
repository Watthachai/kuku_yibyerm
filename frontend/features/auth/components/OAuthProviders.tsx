"use client";

import { OAuthButton } from "./OAuthButton";
import { OAuthService } from "../services/oauth";
import { memo } from "react";

interface OAuthProvidersProps {
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
  callbackUrl?: string;
  showDivider?: boolean;
  dividerText?: string;
}

export const OAuthProviders = memo(function OAuthProviders({
  disabled,
  size,
  callbackUrl,
  showDivider = true,
  dividerText = "หรือ",
}: OAuthProvidersProps) {
  const providers = OAuthService.getAvailableProviders();

  if (!providers || providers.length < 1) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {providers.map((provider) => (
          <OAuthButton
            key={provider.id}
            provider={provider.id}
            disabled={disabled}
            size={size}
            callbackUrl={callbackUrl}
          />
        ))}
      </div>

      {showDivider && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">{dividerText}</span>
          </div>
        </div>
      )}
    </div>
  );
});
