import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User, type Session } from "../types";

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearSession: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: (session) => {
        set({
          session,
          isAuthenticated: !!session,
        });

        // Store tokens in localStorage
        if (typeof window !== "undefined") {
          if (session) {
            localStorage.setItem("authToken", session.accessToken);
            localStorage.setItem("refreshToken", session.refreshToken);
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
          }
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearSession: () => {
        set({
          session: null,
          isAuthenticated: false,
        });

        // Clear tokens from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
        }
      },

      updateUser: (userData) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              user: { ...session.user, ...userData },
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
