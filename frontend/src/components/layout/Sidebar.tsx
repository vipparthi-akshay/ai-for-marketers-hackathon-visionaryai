"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/content", label: "Content", icon: "✍️" },
  { href: "/campaigns", label: "Campaigns", icon: "🚀" },
  { href: "/seo", label: "SEO", icon: "🔍" },
  { href: "/ads", label: "Ads", icon: "📢" },
  { href: "/competitors", label: "Competitors", icon: "🏢" },
  { href: "/personas", label: "Personas", icon: "👥" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/automation", label: "Automation", icon: "⚙️" },
  { href: "/chat", label: "AI Chat", icon: "💬" },
];

interface SidebarProps {
  businessId?: string;
}

export function Sidebar({ businessId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/50 bg-card/50 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg" />
          <span className="font-bold text-lg">MarketPilot</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const href = businessId ? `/business/${businessId}${item.href}` : item.href;
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">MarketPilot AI v1.0</div>
      </div>
    </aside>
  );
}
