"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowLeft, Home, Bot, TrendingUp, Zap, BarChart3, Target,
  Search, Menu, X, LogOut, Command,
} from "lucide-react";
import { getSession, clearSession, type Registration } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: Bot, label: "AI Content Engine", href: "/tracks/content-engine" },
  { icon: TrendingUp, label: "AI Ads Optimization", href: "/tracks/ads-optimizer" },
  { icon: Zap, label: "Marketing Automation", href: "/tracks/marketing-automation" },
  { icon: BarChart3, label: "Customer Insights", href: "/tracks/analytics" },
  { icon: Target, label: "Personalization", href: "/tracks/personalization" },
];

export default function TrackPage({
  title,
  badge,
  description,
  children,
  actions,
}: {
  title: string;
  badge: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState<Registration | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/signin");
    } else {
      setAccount(session);
    }
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">Loading workspace…</span>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    clearSession();
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(210,90%,60%)] shadow-lg shadow-primary/30">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-sm font-bold leading-tight">MarketGenius AI</div>
            <div className="text-[10px] text-muted-foreground">Marketing Suite</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Tool navigation">
          <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Home" active={pathname === "/"} />
          <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            AI Tools
          </div>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                href={item.href}
                icon={<item.icon className="h-4 w-4" />}
                label={item.label}
                active={active}
              />
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
            }}
            className="mb-2 flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            Search…
            <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border border-border px-1 text-[10px]">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
          <div className="flex items-center gap-2 rounded-lg p-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(210,90%,60%)] text-xs font-bold text-primary-foreground">
              {account.teamName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{account.teamName}</div>
              <div className="truncate text-[10px] text-muted-foreground">{account.email}</div>
            </div>
            <button onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="text-muted-foreground transition-colors hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="px-2 pb-1">
            <ThemeToggle className="h-8 w-full" />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 lg:hidden">
        <div className="glass-nav flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle navigation" className="p-1.5">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(210,90%,60%)]">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">MarketGenius AI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-8 w-8" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {account.teamName.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="glass-strong overflow-hidden border-b border-border"
            >
              <nav className="space-y-1 p-3" aria-label="Mobile navigation">
                <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Home" active={pathname === "/"} />
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <NavLink key={item.href} href={item.href} icon={<item.icon className="h-4 w-4" />} label={item.label} active={active} />
                  );
                })}
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-red-400">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <div className="lg:pl-60">
        <header className="glass-nav sticky top-0 z-30 hidden items-center justify-between px-6 py-3.5 lg:flex">
          <div className="flex items-center gap-3">
            <Link
              href="/tracks"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Tools
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="inline-flex items-center gap-0.5 rounded border border-border px-1 text-[10px]">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <ThemeToggle className="h-8 w-8" />
          </div>
        </header>

        <main className="px-4 pb-24 pt-24 md:px-8 lg:pt-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl"
          >
            <div className="mb-8 lg:mt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary lg:hidden">
                    <Sparkles className="h-3 w-3" />
                    {badge}
                  </span>
                  <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
                  {description && <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {account.teamName.slice(0, 1).toUpperCase()}
                    </span>
                    Signed in as <span className="font-medium text-foreground">{account.teamName}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      AI online
                    </span>
                  </div>
                </div>
                {actions && <div className="lg:hidden">{actions}</div>}
              </div>
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-gradient-to-b from-primary to-[hsl(210,90%,62%)]"
        />
      )}
      <span className={cn("transition-transform duration-200 group-hover:scale-110", active && "text-primary")}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
