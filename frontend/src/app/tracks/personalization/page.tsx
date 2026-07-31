"use client";

import { useState } from "react";
import TrackPage from "@/components/TrackPage";
import { Target, Users, Plus, Trash2, Sparkles, Check, Copy } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

type Segment = { id: number; name: string; rule: string; value: string };

const RULE_OPTIONS = [
  "Visitors from region",
  "Returning visitors",
  "Engaged with email",
  "Purchased in last 30 days",
  "High-value customers",
  "Cart abandoners",
];

const ANGLES = ["by name & behavior", "by shopping stage", "by channel preference", "by loyalty level"];

function generateVariants(segment: Segment, product: string, goal: string) {
  const name = segment.name;
  const rule = segment.rule.toLowerCase();
  return [
    {
      label: "Subject line",
      text: `${name} — we built this for you`,
    },
    {
      label: "Hero headline",
      text: `${product}, tailored to ${rule}${segment.value ? ` (${segment.value})` : ""}`,
    },
    {
      label: "Body copy",
      text: `Hi there — you're part of ${name}, so this offer is shaped around what ${rule} actually care about. ${goal} has never been this personal.`,
    },
    {
      label: "CTA button",
      text: goal ? `Get ${goal.toLowerCase()}` : "Claim your offer",
    },
  ];
}

export default function Personalization() {
  const [product, setProduct] = useState("MarketGenius AI");
  const [goal, setGoal] = useState("Increase conversions");
  const [angle, setAngle] = useState(ANGLES[0]);
  const [segments, setSegments] = useState<Segment[]>([
    { id: 1, name: "First-time visitors", rule: RULE_OPTIONS[0], value: "United States" },
    { id: 2, name: "Returning shoppers", rule: RULE_OPTIONS[2], value: "" },
  ]);
  const [generated, setGenerated] = useState<{ name: string; items: { label: string; text: string }[] }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const update = (id: number, patch: Partial<Segment>) =>
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: number) => setSegments((prev) => prev.filter((s) => s.id !== id));

  const add = () =>
    setSegments((prev) => [...prev, { id: Date.now(), name: "", rule: RULE_OPTIONS[0], value: "" }]);

  const generate = () => {
    setError("");
    if (!product.trim() || !goal.trim()) {
      setError("Please enter the product and goal.");
      return;
    }
    if (segments.some((s) => !s.name.trim())) {
      setError("Every segment needs a name.");
      return;
    }
    setGenerated(
      segments.map((s) => ({
        name: `${s.name} — ${angle}`,
        items: generateVariants(s, product.trim(), goal.trim()),
      }))
    );
    setCopied(null);
  };

  const copyAll = async () => {
    if (generated.length === 0) return;
    const text = generated
      .map(
        (g) =>
          `[${g.name}]\n` + g.items.map((i) => `${i.label}: ${i.text}`).join("\n")
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied("all");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <TrackPage
      badge="Track 5"
      title="Personalization Engines"
      description="Define audience segments with rules and instantly generate personalized message variants for each one."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Product</label>
              <input value={product} onChange={(e) => setProduct(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Goal</label>
              <input value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Personalization Angle</label>
            <select value={angle} onChange={(e) => setAngle(e.target.value)} className={inputClass}>
              {ANGLES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Segments</label>
              <button
                onClick={add}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Segment
              </button>
            </div>
            <div className="space-y-3">
              {segments.map((s) => (
                <div key={s.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={s.name}
                    onChange={(e) => update(s.id, { name: e.target.value })}
                    placeholder="Segment name"
                    className={`${inputClass} mb-2`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={s.rule} onChange={(e) => update(s.id, { rule: e.target.value })} className={inputClass}>
                      {RULE_OPTIONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                    <input
                      value={s.value}
                      onChange={(e) => update(s.id, { value: e.target.value })}
                      placeholder="Rule value (optional)"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={generate}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Target className="h-4 w-4" />
            Generate Personalized Content
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Personalized Variants</h3>
            {generated.length > 0 && (
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {copied === "all" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "all" ? "Copied" : "Copy All"}
              </button>
            )}
          </div>
          {generated.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg p-10">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generated variants will appear here.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {generated.map((g, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="font-medium text-sm mb-2 text-primary">{g.name}</div>
                  <div className="space-y-1.5">
                    {g.items.map((item) => (
                      <div key={item.label} className="text-sm">
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{item.label}: </span>
                        <span className="text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TrackPage>
  );
}
