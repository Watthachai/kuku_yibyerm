import { create } from "zustand";

export interface Toast {
  type: "Success" | "Error" | "Warning" | "Info";
  message: string;
  duration?: number;
}

interface UiState {
  toast: Toast | null;
  isLoading: boolean;
}

interface UiActions {
  setToast: (toast: Toast | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState & UiActions>((set) => ({
  toast: null,
  isLoading: false,

  setToast: (toast) => set({ toast }),
  setLoading: (isLoading) => set({ isLoading }),
  clearToast: () => set({ toast: null }),
}));
