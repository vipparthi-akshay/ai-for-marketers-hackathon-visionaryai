"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function CompetitorsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [name, setName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!name) return;
    setAnalyzing(true);
    try {
      const data = await api.competitors.analyze({
        business_id: businessId,
        competitor_name: name,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Competitor Intelligence</h2>
          <p className="text-muted-foreground">Analyze competitors and find opportunities</p>
        </div>

        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter competitor name..."
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !name}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {analyzing && (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <div className="animate-pulse-soft text-4xl mb-4">🏢</div>
            <p className="text-muted-foreground">AI is analyzing your competitor...</p>
          </div>
        )}

        {!analyzing && result && result.analysis && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold mb-3">Competitive Analysis: {result.name}</h3>

              {result.analysis.swot_comparison && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                    <h4 className="text-sm font-semibold text-green-500 mb-2">Your Strengths</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.your_strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                    <h4 className="text-sm font-semibold text-red-500 mb-2">Your Weaknesses</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.your_weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <h4 className="text-sm font-semibold text-blue-500 mb-2">Market Opportunities</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.market_opportunities?.map((o: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-sm font-semibold text-amber-500 mb-2">Market Threats</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.market_threats?.map((t: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {result.analysis.marketing_gaps?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-3">Marketing Gaps</h3>
                <div className="space-y-2">
                  {result.analysis.marketing_gaps.map((gap: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <span className="text-primary">🎯</span>
                      <span className="text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.analysis.recommended_strategies?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-3">Recommended Strategies</h3>
                <div className="space-y-2">
                  {result.analysis.recommended_strategies.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
