"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };

function buildSmoothPath(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function scalePoints(
  data: number[],
  width: number,
  height: number,
  padding = 6,
  minOverride?: number,
  maxOverride?: number
): Point[] {
  const max = maxOverride ?? Math.max(...data) * 1.08;
  const min = minOverride ?? 0;
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - ((v - min) / range) * (height - padding * 2),
  }));
}

export function AreaChart({
  data,
  className,
  height = 160,
  label,
  forecastFrom,
}: {
  data: number[];
  className?: string;
  height?: number;
  label?: string;
  forecastFrom?: number;
}) {
  const id = useId().replace(/:/g, "");
  const width = 600;
  const pts = scalePoints(data, width, height);
  const line = buildSmoothPath(pts);
  const area = `${line} L ${width - 6},${height} L 6,${height} Z`;
  const forecastIndex = forecastFrom ?? data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} role="img" aria-label={label ?? "Area chart"}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(262 72% 62% / 0.45)" />
          <stop offset="100%" stopColor="hsl(262 72% 62% / 0)" />
        </linearGradient>
        <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(262 72% 68%)" />
          <stop offset="100%" stopColor="hsl(210 90% 66%)" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${id})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {forecastIndex < data.length && (
        <path
          d={buildSmoothPath(pts.slice(forecastIndex))}
          fill="none"
          stroke="hsl(210 90% 62% / 0.5)"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      )}
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i >= forecastIndex ? 0 : 3}
          fill="hsl(262 72% 68%)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  labels,
  className,
  height = 150,
  label,
  highlight,
}: {
  data: number[];
  labels?: string[];
  className?: string;
  height?: number;
  label?: string;
  highlight?: (index: number) => boolean;
}) {
  const max = Math.max(...data) * 1.1 || 1;
  return (
    <div className={cn("flex w-full items-end gap-2", className)} role="img" aria-label={label ?? "Bar chart"}>
      {data.map((v, i) => {
        const h = Math.max(4, (v / max) * height);
        const isHi = highlight?.(i);
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "w-full rounded-t-md",
                isHi
                  ? "bg-gradient-to-t from-primary to-[hsl(210,90%,66%)] shadow-lg shadow-primary/30"
                  : "bg-gradient-to-t from-primary/40 to-primary/20"
              )}
            />
            {labels && <span className="text-[10px] text-muted-foreground">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({
  segments,
  size = 180,
  stroke = 22,
  className,
  children,
}: {
  segments: { value: number; color: string; label?: string }[];
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" stroke="hsl(var(--muted))" opacity="0.5" />
        {segments.map((s, i) => {
          const len = (s.value / total) * circumference;
          const el = (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              fill="none"
              stroke={s.color}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function FunnelChart({
  stages,
  className,
}: {
  stages: { label: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(...stages.map((s) => s.value)) || 1;
  return (
    <div className={cn("space-y-2", className)}>
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-right text-xs text-muted-foreground">{s.label}</div>
          <div className="flex-1 overflow-hidden rounded-md bg-muted/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-7 items-center justify-end rounded-md bg-gradient-to-r from-primary/30 to-primary/70 px-2"
            >
              <span className="text-[11px] font-semibold text-primary-foreground">{s.value.toLocaleString()}</span>
            </motion.div>
          </div>
          {i < stages.length - 1 && (
            <div className="w-8 shrink-0 text-xs text-muted-foreground">
              {stages[i + 1].value > 0 ? `${Math.round((stages[i + 1].value / s.value) * 100)}%` : "—"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  data,
  className,
  width = 120,
  height = 36,
}: {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const pts = scalePoints(data, width, height, 3);
  const d = buildSmoothPath(pts);
  const up = data[data.length - 1] >= data[0];
  const stroke = up ? "hsl(160 84% 58%)" : "hsl(0 84% 62%)";
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9 }}
      />
    </svg>
  );
}

export function ProgressBar({
  value,
  className,
  gradient = "from-primary via-[hsl(250,80%,62%)] to-[hsl(210,90%,62%)]",
}: {
  value: number;
  className?: string;
  gradient?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
      />
    </div>
  );
}
