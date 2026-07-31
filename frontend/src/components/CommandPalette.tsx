"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, LayoutGrid, Bot, TrendingUp, Zap, BarChart3, Target,
  Search, CornerDownLeft, Moon, Sun, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CmdItem = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  action: () => void;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const go = (href: string) => () => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.classList.contains("light") ? "dark" : "light";
    root.classList.toggle("light", next === "light");
    window.localStorage.setItem("theme", next);
    setOpen(false);
  };

  const items: CmdItem[] = [
    { id: "home", label: "Go to Home", hint: "Landing page", icon: <Home className="h-4 w-4" />, action: go("/") },
    { id: "tracks", label: "Go to All Tools", hint: "/tracks", icon: <LayoutGrid className="h-4 w-4" />, action: go("/tracks") },
    { id: "content", label: "AI Content Engine", hint: "Generate blogs, ads, emails", icon: <Bot className="h-4 w-4" />, action: go("/tracks/content-engine") },
    { id: "ads", label: "AI Ads Optimization", hint: "Optimize ad spend & ROAS", icon: <TrendingUp className="h-4 w-4" />, action: go("/tracks/ads-optimizer") },
    { id: "automation", label: "Marketing Automation", hint: "Build workflows", icon: <Zap className="h-4 w-4" />, action: go("/tracks/marketing-automation") },
    { id: "analytics", label: "Customer Insights & Analytics", hint: "Funnels, forecasts, insights", icon: <BarChart3 className="h-4 w-4" />, action: go("/tracks/analytics") },
    { id: "personalization", label: "Personalization Engine", hint: "Variants & A/B testing", icon: <Target className="h-4 w-4" />, action: go("/tracks/personalization") },
    { id: "theme", label: "Toggle Light / Dark Mode", hint: "Switch theme", icon: <Moon className="h-4 w-4" />, action: toggleTheme },
  ];

  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return !q || i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q);
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setActive(0);
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[active];
        if (item) item.action();
      }
    },
    [filtered, active]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] cmd-backdrop flex items-start justify-center px-4 pt-[18vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages and actions…"
                className="w-full bg-transparent py-3.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                aria-label="Search commands"
              />
              <kbd className="hidden shrink-0 items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
                <CornerDownLeft className="h-3 w-3" /> enter
              </kbd>
            </div>
            <div className="max-h-[40vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      i === active ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-border", i === active && "border-primary/40 text-primary")}>
                      {item.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium text-foreground">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    {i === active && <ArrowRight className="h-4 w-4 text-primary" />}
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Moon className="h-3 w-3" /> Ctrl K to open</span>
              <span className="ml-auto inline-flex items-center gap-1"><Sun className="h-3 w-3" /> AI-powered commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
