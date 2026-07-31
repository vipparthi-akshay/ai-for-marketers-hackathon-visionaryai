export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function fmtCurrency(n: number, digits = 2): string {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: digits });
}

export function fmtNumber(n: number, digits = 2): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function fmtPercent(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function countWords(text: string): number {
  const matches = text.trim().match(/\b[\w'-]+\b/g);
  return matches ? matches.length : 0;
}

export function readingTimeMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

export function wordCountToRange(words: number): "short" | "medium" | "long" {
  if (words < 200) return "short";
  if (words < 700) return "medium";
  return "long";
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareText(title: string, text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function uid(): number {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? parseInt(crypto.randomUUID().replace(/[^0-9]/g, "").slice(0, 12), 10)
    : Date.now();
}
