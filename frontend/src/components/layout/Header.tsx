"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useBusinessStore } from "@/stores/businessStore";
import { Avatar } from "@/components/ui/Avatar";
import { Sun, Moon, Search, Menu, X, Bell, ChevronRight, LogOut, User, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  content: "Content Engine",
  campaigns: "Campaign Builder",
  seo: "SEO Engine",
  ads: "Ads Optimization",
  competitors: "Competitor Intelligence",
  personas: "Customer Personas",
  analytics: "Analytics",
  automation: "Automation",
  chat: "AI Chat",
  calendar: "Content Calendar",
  collaboration: "Team Collaboration",
};

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const { theme, toggleTheme, toggleCommandPalette, mobileSidebarOpen, toggleMobileSidebar, toggleNotificationDrawer, notificationDrawerOpen, closeNotificationDrawer } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    for (const [key, title] of Object.entries(pageTitles)) {
      if (pathname.includes(`/${key}`)) return title;
    }
    if (pathname.includes("/business/new")) return "New Business";
    if (pathname.includes("/onboarding")) return "Onboarding";
    if (pathname.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  const activeBusiness = useBusinessStore((s) => s.activeBusiness);

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const homeHref = activeBusiness?.id ? `/business/${activeBusiness.id}` : "/dashboard";
    const crumbs: { label: string; href?: string }[] = [{ label: "Home", href: homeHref }];

    if (parts.includes("business")) {
      if (parts.includes("new")) {
        crumbs.push({ label: "Business", href: "/business/new" });
        crumbs.push({ label: "New" });
      } else {
        crumbs.push({ label: "Business" });
      }
    } else if (parts.length > 0) {
      const last = parts[parts.length - 1];
      crumbs.push({ label: pageTitles[last] || last.charAt(0).toUpperCase() + last.slice(1) });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const userMenuItems = [
    { label: "Profile", icon: User, href: "/settings" },
    { label: "Settings", icon: Settings, href: "/settings" },
    { label: "Help", icon: HelpCircle, href: "#" },
  ];

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Title and Breadcrumbs */}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">{getPageTitle()}</h1>
          {/* Breadcrumbs - desktop only */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Search shortcut */}
        <button
          onClick={toggleCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={toggleCommandPalette}
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button onClick={toggleNotificationDrawer} className="relative p-2 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors"
          >
            <Avatar fallback={user?.full_name || "User"} size="sm" />
            <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {user?.full_name || "User"}
            </span>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-card shadow-lg z-[60] animate-scale-in overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
              <div className="p-1">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="p-1 border-t border-border">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <NotificationDrawer open={notificationDrawerOpen} onClose={closeNotificationDrawer} />
    </header>
  );
}
