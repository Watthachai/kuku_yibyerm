"use client";

import { Button } from "@/components/ui/button";
import { Chrome, Loader2 } from "lucide-react";
import { useOAuth } from "../hooks/useOAuth";
import { memo } from "react";

interface OAuthButtonProps {
  provider: "google";
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
  callbackUrl?: string;
}

const providerConfig = {
  google: {
    name: "Google",
    icon: Chrome,
    displayName: "เข้าสู่ระบบด้วย Google",
    className:
      "border-red-200 hover:border-red-300 hover:bg-red-50 bg-white text-gray-700",
  },
} as const;

export const OAuthButton = memo(function OAuthButton({
  provider,
  disabled,
  size = "default",
  className = "",
  callbackUrl,
}: OAuthButtonProps) {
  const { signIn, isLoading } = useOAuth();
  const config = providerConfig[provider];

  const handleClick = async () => {
    await signIn(provider, { callbackUrl });
  };

  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={`w-full transition-all duration-200 ${config.className} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span className="ml-2">{config.displayName}</span>
    </Button>
  );
});
