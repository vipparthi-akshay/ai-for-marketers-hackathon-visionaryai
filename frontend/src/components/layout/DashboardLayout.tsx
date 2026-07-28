"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastContainer } from "@/components/shared/Toast";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useUIStore } from "@/stores/uiStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
  businessId?: string;
}

export function DashboardLayout({ children, businessId }: DashboardLayoutProps) {
  const theme = useUIStore((s) => s.theme);
  const initTheme = useUIStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar businessId={businessId} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
        <ToastContainer />
        <CommandPalette />
      </div>
    </ErrorBoundary>
  );
}
