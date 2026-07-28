import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: "light" | "dark";
  commandPaletteOpen: boolean;
  notificationDrawerOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  initTheme: () => void;
  toggleCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleNotificationDrawer: () => void;
  closeNotificationDrawer: () => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: "dark",
  commandPaletteOpen: false,
  notificationDrawerOpen: false,
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") localStorage.setItem("theme", next);
      return { theme: next };
    }),
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
    set({ theme });
  },
  initTheme: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored && stored !== get().theme) {
      set({ theme: stored });
    }
  },
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleNotificationDrawer: () =>
    set((state) => ({ notificationDrawerOpen: !state.notificationDrawerOpen })),
  closeNotificationDrawer: () => set({ notificationDrawerOpen: false }),
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
