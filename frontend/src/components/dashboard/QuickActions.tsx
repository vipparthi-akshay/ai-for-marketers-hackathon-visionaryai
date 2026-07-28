"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pen, Rocket, Search, Megaphone, Building2, Users, Calendar, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const quickActions: { label: string; icon: LucideIcon; href: string; gradient: string; shortcut: string }[] = [
  { label: "Generate Content", icon: Pen, href: "/content", gradient: "from-indigo-500/20 to-violet-500/10", shortcut: "1" },
  { label: "Content Calendar", icon: Calendar, href: "/calendar", gradient: "from-blue-500/20 to-indigo-500/10", shortcut: "2" },
  { label: "Build Campaign", icon: Rocket, href: "/campaigns", gradient: "from-rose-500/20 to-pink-500/10", shortcut: "3" },
  { label: "Run SEO Audit", icon: Search, href: "/seo", gradient: "from-indigo-500/20 to-blue-500/10", shortcut: "4" },
  { label: "Create Ads", icon: Megaphone, href: "/ads", gradient: "from-amber-500/20 to-orange-500/10", shortcut: "5" },
  { label: "Analyze Competitor", icon: Building2, href: "/competitors", gradient: "from-violet-500/20 to-purple-500/10", shortcut: "6" },
  { label: "Generate Personas", icon: Users, href: "/personas", gradient: "from-indigo-400/20 to-cyan-500/10", shortcut: "7" },
  { label: "Automate", icon: Settings, href: "/automation", gradient: "from-slate-500/20 to-gray-500/10", shortcut: "8" },
];

interface QuickActionsProps {
  businessId: string;
}

export function QuickActions({ businessId }: QuickActionsProps) {
  const router = useRouter();
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleAction = useCallback((action: typeof quickActions[number], idx: number) => {
    setLoadingIdx(idx);
    setTimeout(() => {
      router.push(`/business/${businessId}${action.href}`);
    }, 300);
  }, [router, businessId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "8" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const idx = parseInt(e.key) - 1;
        if (quickActions[idx]) {
          handleAction(quickActions[idx], idx);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAction]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          const isLoading = loadingIdx === idx;
          const isHovered = hoveredIdx === idx;
          return (
            <motion.button
              key={action.label}
              onClick={() => handleAction(action, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50 transition-all overflow-hidden group",
                isLoading ? "opacity-70 pointer-events-none" : ""
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  action.gradient
                )}
                style={
                  // Use inline style to avoid animation issues with rgba(0,0,0,0)
                  {
                    backgroundImage: action.gradient.replace("opacity-0", "0")
                  } as any
                }
              />
              <div className="relative z-10">
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", action.gradient)}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-foreground/70" />
                  )}
                </div>
              </div>
              <span className="relative z-10 text-xs text-center font-medium leading-tight">{action.label}</span>
              <span className="absolute top-1.5 right-1.5 z-10 text-[10px] font-mono text-muted-foreground/40 bg-muted/30 px-1 py-0.5 rounded">
                {action.shortcut}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
