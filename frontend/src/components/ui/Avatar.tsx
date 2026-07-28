"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-14 w-14 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "from-indigo-500 to-violet-500",
    "from-blue-500 to-indigo-500",
    "from-indigo-400 to-purple-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-slate-500 to-gray-600",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : "?";
  const colorClass = fallback ? hashStringToColor(fallback) : "from-gray-500 to-gray-600";

  if (src) {
    return (
      <img
        src={src}
        alt={alt || fallback || "Avatar"}
        className={cn(
          "rounded-full object-cover ring-2 ring-border",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-white ring-2 ring-border bg-gradient-to-br",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };
