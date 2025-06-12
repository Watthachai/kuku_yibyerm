import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/features/auth/services/api";

export const useSignIn = () => {
  return useMutation({
    mutationFn: authAPI.signIn,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.signUp,
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.signOut,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Remove tokens from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: authAPI.getProfile,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("authToken"),
    retry: false,
  });
};

export const useVerifyToken = () => {
  return useQuery({
    queryKey: ["auth", "verify"],
    queryFn: authAPI.verifyToken,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("authToken"),
    retry: false,
  });
};
