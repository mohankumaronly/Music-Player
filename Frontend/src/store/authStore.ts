import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "../lib/constants";
import type { Role } from "../api/types";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  role: Role | null;

  setSession: (s: { accessToken: string; email: string; role: Role }) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      email: null,
      role: null,

      setSession: ({ accessToken, email, role }) =>
        set({ accessToken, email, role }),

      clear: () => set({ accessToken: null, email: null, role: null }),

      isAuthenticated: () => Boolean(get().accessToken),
      isAdmin: () => get().role === "ADMIN" && Boolean(get().accessToken),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        accessToken: s.accessToken,
        email: s.email,
        role: s.role,
      }),
    }
  )
);