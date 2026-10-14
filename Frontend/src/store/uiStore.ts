import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "../lib/constants";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setSidebarOpen: (v: boolean) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#08080c" : "#ffffff");
}

const initialTheme: Theme =
  (typeof window !== "undefined" &&
    (localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null)) ||
  (typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: initialTheme,
      sidebarOpen: false,

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },

      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },

      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    }
  )
);