"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  type?: "card" | "text" | "chart" | "list";
}

export function LoadingSkeleton({ className, lines = 3, type = "card" }: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className={cn("rounded-xl border border-border/50 bg-card p-6 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-3 bg-muted rounded w-full mb-2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className={cn("rounded-xl border border-border/50 bg-card p-6 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-1/4 mb-6" />
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 bg-muted rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-muted rounded w-1/3 mb-1" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
