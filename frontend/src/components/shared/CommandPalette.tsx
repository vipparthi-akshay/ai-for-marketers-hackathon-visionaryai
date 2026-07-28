"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { Search, Pen, Rocket, Megaphone, Building2, Users, TrendingUp, Settings, MessageSquare, Calendar, X, Clock, Layout } from "lucide-react";

interface CommandItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  keywords: string[];
  category: string;
}

const MAX_RECENT = 5;
const STORAGE_KEY = "command-palette-recent";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(label: string) {
  const recent = getRecentSearches().filter((r) => r !== label);
  recent.unshift(label);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    { label: "Dashboard", icon: <TrendingUp className="h-4 w-4" />, href: "/dashboard", keywords: ["home", "overview"], category: "Navigation" },
    { label: "Generate Content", icon: <Pen className="h-4 w-4" />, href: "/content", keywords: ["blog", "post", "write", "article"], category: "AI Tools" },
    { label: "Content Calendar", icon: <Calendar className="h-4 w-4" />, href: "/calendar", keywords: ["schedule", "plan"], category: "Navigation" },
    { label: "Build Campaign", icon: <Rocket className="h-4 w-4" />, href: "/campaigns", keywords: ["marketing", "strategy"], category: "AI Tools" },
    { label: "SEO Audit", icon: <Search className="h-4 w-4" />, href: "/seo", keywords: ["search", "optimize", "keywords"], category: "AI Tools" },
    { label: "Create Ads", icon: <Megaphone className="h-4 w-4" />, href: "/ads", keywords: ["google", "meta", "linkedin"], category: "AI Tools" },
    { label: "Analyze Competitor", icon: <Building2 className="h-4 w-4" />, href: "/competitors", keywords: ["competition", "rival"], category: "AI Tools" },
    { label: "Generate Personas", icon: <Users className="h-4 w-4" />, href: "/personas", keywords: ["audience", "customer"], category: "AI Tools" },
    { label: "Automation", icon: <Settings className="h-4 w-4" />, href: "/automation", keywords: ["workflow", "automate"], category: "Navigation" },
    { label: "AI Chat", icon: <MessageSquare className="h-4 w-4" />, href: "/chat", keywords: ["assistant", "help", "ask"], category: "AI Tools" },
    { label: "Team Collaboration", icon: <Users className="h-4 w-4" />, href: "/collaboration", keywords: ["team", "collaborate"], category: "Navigation" },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords.some((kw) => kw.includes(query.toLowerCase()))
  );

  // Group by category
  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  const recentSearches = getRecentSearches().filter((r) =>
    query ? r.toLowerCase().includes(query.toLowerCase()) : true
  );

  const allItems = filtered;
  const showRecent = !query && recentSearches.length > 0;

  const navigate = useCallback(
    (href: string, label: string) => {
      saveRecentSearch(label);
      closeCommandPalette();
      router.push(href);
    },
    [closeCommandPalette, router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
      if (e.key === "Escape") {
        closeCommandPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeCommandPalette]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showRecent
      ? recentSearches.map((r) => commands.find((c) => c.label === r)).filter(Boolean)
      : allItems;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showRecent && items[selectedIndex]) {
        const cmd = items[selectedIndex] as CommandItem;
        navigate(cmd.href, cmd.label);
      } else if (!showRecent && allItems[selectedIndex]) {
        const cmd = allItems[selectedIndex];
        navigate(cmd.href, cmd.label);
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector("[data-selected='true']");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  let itemIndex = -1;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCommandPalette} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 py-4 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            placeholder="Type a command or search..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button onClick={closeCommandPalette} className="shrink-0 p-1 hover:bg-muted rounded transition-colors">
            <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {showRecent && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Recent
              </div>
              {recentSearches.slice(0, MAX_RECENT).map((label) => {
                const cmd = commands.find((c) => c.label === label);
                if (!cmd) return null;
                itemIndex++;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <button
                    key={`recent-${label}`}
                    data-selected={isSelected}
                    onClick={() => navigate(cmd.href, cmd.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                      isSelected ? "bg-muted/80 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
                    <span>{cmd.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground/30">Recent</span>
                  </button>
                );
              })}
            </div>
          )}

          {!showRecent && Object.keys(grouped).length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!showRecent &&
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  {category}
                </div>
                {items.map((cmd) => {
                  itemIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.label}
                      data-selected={isSelected}
                      onClick={() => navigate(cmd.href, cmd.label)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                        isSelected ? "bg-muted/80 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <span className="text-muted-foreground">{cmd.icon}</span>
                      <span>{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">&#8593;&#8595;</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">&#9166;</kbd>
              Select
            </span>
          </div>
          <span>{allItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
