"use client";

import { useState } from "react";
import TrackPage from "@/components/TrackPage";
import { Plus, Trash2, TrendingUp, Gauge, Wallet, MousePointerClick, Target, Lightbulb } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

type AdSet = {
  id: number;
  name: string;
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

type Metric = {
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
};

function calcMetrics(a: AdSet): Metric {
  const ctr = a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0;
  const cpc = a.clicks > 0 ? a.budget / a.clicks : 0;
  const cpm = a.impressions > 0 ? (a.budget / a.impressions) * 1000 : 0;
  const cpa = a.conversions > 0 ? a.budget / a.conversions : 0;
  const roas = a.budget > 0 ? a.revenue / a.budget : 0;
  return { ctr, cpc, cpm, cpa, roas };
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function fmtCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function AdsOptimizer() {
  const [ads, setAds] = useState<AdSet[]>([
    { id: 1, name: "Facebook – Awareness", budget: 1200, impressions: 240000, clicks: 4800, conversions: 60, revenue: 3600 },
    { id: 2, name: "Google – Search", budget: 1500, impressions: 90000, clicks: 4500, conversions: 90, revenue: 6750 },
    { id: 3, name: "Instagram – Retarget", budget: 800, impressions: 60000, clicks: 1200, conversions: 40, revenue: 3200 },
  ]);

  const update = (id: number, key: keyof AdSet, value: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: key === "name" ? value : Number(value) || 0 } : a))
    );
  };

  const remove = (id: number) => setAds((prev) => prev.filter((a) => a.id !== id));

  const add = () =>
    setAds((prev) => [
      ...prev,
      { id: Date.now(), name: `New Ad Set ${prev.length + 1}`, budget: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
    ]);

  const withMetrics = ads.map((a) => ({ ...a, m: calcMetrics(a) }));
  const total = withMetrics.reduce(
    (acc, a) => ({
      budget: acc.budget + a.budget,
      impressions: acc.impressions + a.impressions,
      clicks: acc.clicks + a.clicks,
      conversions: acc.conversions + a.conversions,
      revenue: acc.revenue + a.revenue,
    }),
    { budget: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );
  const totalCtr = total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0;
  const totalCpa = total.conversions > 0 ? total.budget / total.conversions : 0;
  const totalRoas = total.budget > 0 ? total.revenue / total.budget : 0;

  const best = [...withMetrics].sort((a, b) => b.m.roas - a.m.roas)[0];
  const worst = [...withMetrics].sort((a, b) => a.m.roas - b.m.roas)[0];

  const recommendations: string[] = [];
  if (best && best.budget > 0) {
    recommendations.push(
      `Shift budget toward "${best.name}" — it delivers the highest ROAS (${fmt(best.m.roas)}x). Increasing its share should lift overall returns.`
    );
  }
  if (worst && worst.budget > 0 && worst.m.roas < 1) {
    recommendations.push(
      `"${worst.name}" is spending more than it returns (ROAS ${fmt(worst.m.roas)}x). Pause or reduce it and reinvest the saved budget.`
    );
  }
  const lowCtr = withMetrics.filter((a) => a.m.ctr < 1);
  if (lowCtr.length > 0) {
    recommendations.push(
      `${lowCtr.map((a) => `"${a.name}"`).join(", ")} ${lowCtr.length === 1 ? "has" : "have"} a CTR below 1%. Refresh creative and tighten targeting to improve relevance.`
    );
  }
  const highCpa = withMetrics.filter((a) => a.m.cpa > 0 && a.m.cpa > 50);
  if (highCpa.length > 0) {
    recommendations.push(
      `${highCpa.map((a) => `"${a.name}"`).join(", ")} ${highCpa.length === 1 ? "shows" : "show"} a CPA above $50. Test new landing pages and audience refinement.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("All ad sets look healthy. Keep testing new creative variants and scale winners by ~10% each week.");
  }

  return (
    <TrackPage
      badge="Track 2"
      title="AI Ads Optimization"
      description="Enter your campaign data and instantly get CTR, CPC, CPM, CPA, and ROAS — plus clear budget recommendations."
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-8">
        {[
          { icon: Wallet, label: "Total Budget", value: fmtCurrency(total.budget) },
          { icon: MousePointerClick, label: "Total Clicks", value: fmt(total.clicks, 0) },
          { icon: Gauge, label: "Overall CTR", value: `${fmt(totalCtr)}%` },
          { icon: Target, label: "Overall CPA", value: fmtCurrency(totalCpa) },
          { icon: TrendingUp, label: "Overall ROAS", value: `${fmt(totalRoas)}x` },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <m.icon className="h-4 w-4 text-primary mb-2" />
            <div className="text-lg font-semibold">{m.value}</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Ad Sets</h3>
          <button
            onClick={add}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Ad Set
          </button>
        </div>

        <div className="space-y-4">
          {withMetrics.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4">
              <div className="grid gap-3 md:grid-cols-7 items-end mb-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input value={a.name} onChange={(e) => update(a.id, "name", e.target.value)} className={inputClass} />
                </div>
                {(
                  [
                    ["budget", "Budget ($)"],
                    ["impressions", "Impressions"],
                    ["clicks", "Clicks"],
                    ["conversions", "Conversions"],
                    ["revenue", "Revenue ($)"],
                  ] as [keyof AdSet, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1">{label}</label>
                    <input
                      type="number"
                      min={0}
                      value={a[key] || ""}
                      onChange={(e) => update(a.id, key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div className="md:col-span-1">
                  <button
                    onClick={() => remove(a.id)}
                    className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-red-400/20 text-red-400 px-3 py-2.5 text-xs font-medium hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5 text-center">
                {[
                  { label: "CTR", value: `${fmt(a.m.ctr)}%` },
                  { label: "CPC", value: fmtCurrency(a.m.cpc) },
                  { label: "CPM", value: fmtCurrency(a.m.cpm) },
                  { label: "CPA", value: fmtCurrency(a.m.cpa) },
                  { label: "ROAS", value: `${fmt(a.m.roas)}x` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-muted/30 px-3 py-2">
                    <div className="text-sm font-semibold">{m.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/30 bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Recommendations</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </TrackPage>
  );
}
