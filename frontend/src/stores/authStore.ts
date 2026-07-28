import { create } from "zustand";

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  organizationId: string | null;
  setUser: (user: User | null) => void;
  setOrganizationId: (id: string) => void;
  logout: () => void;
  initialize: () => void;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function removeCookie(name: string) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  organizationId: null,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  },
  setOrganizationId: (id) => {
    set({ organizationId: id });
    localStorage.setItem("organization_id", id);
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("organization_id");
    removeCookie("access_token");
    removeCookie("refresh_token");
    set({ user: null, isAuthenticated: false, organizationId: null });
  },
  initialize: () => {
    const storedUser = localStorage.getItem("user");
    const storedOrgId = localStorage.getItem("organization_id");
    const accessToken = localStorage.getItem("access_token");
    if (storedUser && accessToken) {
      try {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          organizationId: storedOrgId || null,
        });
      } catch {
        localStorage.removeItem("user");
      }
    }
  },
}));
