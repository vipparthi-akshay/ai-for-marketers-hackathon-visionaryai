"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import {
  LayoutDashboard,
  Pen,
  Rocket,
  Search,
  Megaphone,
  Building2,
  Users,
  TrendingUp,
  Settings,
  MessageSquare,
  Calendar,
  UsersRound,
  ChevronLeft,
  Bell,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon; segment: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, segment: "/dashboard" },
  { href: "/content", label: "Content", icon: Pen, segment: "/content" },
  { href: "/calendar", label: "Calendar", icon: Calendar, segment: "/calendar" },
  { href: "/campaigns", label: "Campaigns", icon: Rocket, segment: "/campaigns" },
  { href: "/seo", label: "SEO", icon: Search, segment: "/seo" },
  { href: "/ads", label: "Ads", icon: Megaphone, segment: "/ads" },
  { href: "/competitors", label: "Competitors", icon: Building2, segment: "/competitors" },
  { href: "/personas", label: "Personas", icon: Users, segment: "/personas" },
  { href: "/analytics", label: "Analytics", icon: TrendingUp, segment: "/analytics" },
  { href: "/automation", label: "Automation", icon: Settings, segment: "/automation" },
  { href: "/chat", label: "AI Chat", icon: MessageSquare, segment: "/chat" },
  { href: "/collaboration", label: "Team", icon: UsersRound, segment: "/collaboration" },
];

interface SidebarProps {
  businessId?: string;
}

export function Sidebar({ businessId }: SidebarProps) {
  const pathname = usePathname();
  const { mobileSidebarOpen, closeMobileSidebar, sidebarOpen, toggleSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const logout = useAuthStore((s) => s.logout);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const collapsed = !sidebarOpen;
  const resolvedBusinessId = businessId || activeBusiness?.id;

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "border-r border-border bg-card flex flex-col h-screen sticky top-0 z-50 transition-all duration-200",
          "max-md:fixed max-md:top-0 max-md:left-0",
          collapsed ? "w-[68px]" : "w-60",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
            onClick={closeMobileSidebar}
          >
            <Image
              src="/logo-white.svg"
              alt="MarketPilot AI"
              width={collapsed ? 28 : 24}
              height={collapsed ? 28 : 24}
              className="rounded-md shrink-0"
            />
            {!collapsed && (
              <span className="font-display font-semibold text-sm whitespace-nowrap text-foreground">
                MarketPilot
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1 rounded-md hover:bg-muted transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Business name */}
        {activeBusiness && !collapsed && (
          <div className="px-4 py-2.5 border-b border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
              Workspace
            </div>
            <div className="text-xs font-medium text-foreground truncate">{activeBusiness.name}</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            let href: string;
            if (item.segment === "/dashboard") {
              href = resolvedBusinessId ? `/business/${resolvedBusinessId}` : "/dashboard";
            } else {
              href = resolvedBusinessId ? `/business/${resolvedBusinessId}${item.href}` : "/onboarding";
            }

            const isActive = pathname.includes(item.segment);
            const Icon = item.icon;
            const disabled = !resolvedBusinessId && item.segment !== "/dashboard";

            return (
              <div key={item.href} className="relative">
                <Link
                  href={href}
                  onClick={closeMobileSidebar}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md text-sm transition-colors duration-150",
                    collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : disabled
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-disabled={disabled}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>

                {/* Tooltip for collapsed state */}
                {collapsed && hoveredItem === item.href && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[60] px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-border space-y-0.5">
          {/* Settings */}
          <Link
            href="/settings"
            onClick={closeMobileSidebar}
            className={cn(
              "flex items-center gap-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          {/* Notifications */}
          <button
            className={cn(
              "w-full flex items-center gap-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
          >
            <Bell className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Notifications</span>}
          </button>

          {/* Sign out */}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
