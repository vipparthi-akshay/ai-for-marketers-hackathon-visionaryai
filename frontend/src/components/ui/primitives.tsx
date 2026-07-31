"use client";

import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

/* ---------- GlassCard ---------- */
export function GlassCard({
  children,
  className,
  spotlight = true,
  border = "border",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
  border?: "border" | "gradient" | "none";
  hover?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !spotlight) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn(
        "rounded-xl bg-card",
        border === "border" && "border border-border",
        border === "gradient" && "gradient-border border border-transparent",
        spotlight && "spotlight-card",
        hover && "card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden="true" />;
}

export function SkeletonLines({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/* ---------- Animated counter ---------- */
export function Counter({
  value,
  format,
  className,
  duration,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const animated = useAnimatedNumber(value, duration);
  const display = format ? format(animated) : Math.round(animated).toLocaleString();
  return <span className={className}>{display}</span>;
}

/* ---------- Progress ring ---------- */
export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  className,
  trackClassName = "text-muted",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  children?: ReactNode;
}) {
  const animated = useAnimatedNumber(value, 900);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);
  const clamped = Math.min(100, Math.max(0, animated));

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke="currentColor"
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke="url(#ringGradient)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 72% 62%)" />
            <stop offset="100%" stopColor="hsl(210 90% 62%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children ?? `${Math.round(clamped)}%`}</div>
    </div>
  );
}

/* ---------- Switch ---------- */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1", className)} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Animated button ---------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:brightness-110",
  secondary:
    "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
  danger: "border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20",
  success: "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500",
};

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  loading = false,
  sparkle = false,
  size = "md",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  sparkle?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const rippleHost = useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const host = rippleHost.current;
    if (host) {
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      host.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    }
    rest.onClick?.(e);
  };

  return (
    <button
      ref={rippleHost}
      {...rest}
      onClick={handleClick}
      disabled={rest.disabled || loading}
      className={cn(
        "ripple-host inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          <span className="sr-only">Loading</span>
          <span className="inline-flex items-center gap-1.5">{children}</span>
        </span>
      ) : (
        children
      )}
      {sparkle && !loading && <SparkleIcon className="ml-1" />}
    </button>
  );
}

/* ---------- Sparkle icon ---------- */
export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4 animate-pulse-glow text-current", className)}
      aria-hidden="true"
    >
      <path
        d="M12 3c.4 3.6 2.4 6.6 5 8-2.6 1.4-4.6 4.4-5 8-.4-3.6-2.4-6.6-5-8 2.6-1.4 4.6-4.4 5-8z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="18.5" cy="5.5" r="1.4" fill="currentColor" opacity="0.7" />
      <circle cx="5.5" cy="17" r="1.2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
