"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function AdsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [platform, setPlatform] = useState("google");
  const [budget, setBudget] = useState("1000");
  const [objective, setObjective] = useState("conversions");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.ads.generate({
        business_id: businessId,
        platform,
        objective,
        budget: parseFloat(budget),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Ads Optimization</h2>
          <p className="text-muted-foreground">Generate and optimize ad campaigns with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Platform</h3>
              <div className="space-y-2">
                {[{ id: "google", label: "Google Ads" }, { id: "meta", label: "Meta Ads" }, { id: "linkedin", label: "LinkedIn Ads" }].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      platform === p.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Objective</h3>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="conversions">Conversions</option>
                <option value="traffic">Traffic</option>
                <option value="awareness">Awareness</option>
                <option value="leads">Lead Generation</option>
              </select>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Budget ($)</h3>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Ads"}
            </button>
          </div>

          <div className="lg:col-span-2">
            {generating && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="animate-pulse-soft text-4xl mb-4">📢</div>
                <p className="text-muted-foreground">AI is creating your ad variations...</p>
              </div>
            )}

            {!generating && !result && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="text-4xl mb-4">📢</div>
                <p className="text-muted-foreground">Configure and generate ad variations</p>
              </div>
            )}

            {!generating && result && (
              <div className="space-y-4">
                {result.ads?.map((ad: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Variation {ad.variation || String.fromCharCode(65 + i)}
                      </span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {ad.predicted_ctr && <span>CTR: {ad.predicted_ctr}%</span>}
                        {ad.predicted_cpc && <span>CPC: ${ad.predicted_cpc}</span>}
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{ad.headline}</h4>
                    <p className="text-sm text-muted-foreground">{ad.description}</p>
                    {ad.call_to_action && (
                      <div className="mt-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                          {ad.call_to_action}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {result.keywords?.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card p-6">
                    <h3 className="font-semibold mb-3">Suggested Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
