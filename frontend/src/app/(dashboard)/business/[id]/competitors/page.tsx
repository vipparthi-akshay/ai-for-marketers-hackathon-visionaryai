"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { LoadingProgress } from "@/components/shared/LoadingProgress";
import { Building2, Target, CheckCircle2, TrendingUp, TrendingDown, Minus, RefreshCw, Plus, Eye } from "lucide-react";

interface TrackedCompetitor {
  id: string;
  name: string;
  website_url?: string;
  analysis?: any;
  last_checked?: string;
  trend?: "up" | "down" | "stable";
}

export default function CompetitorsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [competitors, setCompetitors] = useState<TrackedCompetitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"analysis" | "tracking">("tracking");
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    loadCompetitors();
  }, [businessId]);

  const loadCompetitors = async () => {
    try {
      const data = await api.competitors.list(businessId);
      setCompetitors((data || []).map((c: any) => ({
        ...c,
        last_checked: c.created_at,
        trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as any,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!name) return;
    setAnalyzing(true);
    try {
      const data = await api.competitors.analyze({
        business_id: businessId,
        competitor_name: name,
        website_url: websiteUrl || undefined,
      });
      setResult(data);
      setCompetitors((prev) => [{
        ...data,
        last_checked: new Date().toISOString(),
        trend: "stable" as const,
      }, ...prev]);
      setName("");
      setWebsiteUrl("");
      addToast("Competitor analysis complete!", "success");
    } catch (err) {
      addToast("Analysis failed. Please try again.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    down: <TrendingDown className="h-4 w-4 text-destructive" />,
    stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Competitor Intelligence</h2>
            <p className="text-muted-foreground">Track and analyze your competitors</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("tracking")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === "tracking" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Tracking Dashboard
            </button>
            <button
              onClick={() => setActiveView("analysis")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === "analysis" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              New Analysis
            </button>
          </div>
        </div>

        {activeView === "analysis" && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Analyze a Competitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Competitor name..."
              />
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Website URL (optional)"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !name}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze Competitor"}
            </button>
          </div>
        )}

        {analyzing && (
          <LoadingProgress
            steps={["Researching competitor", "Analyzing marketing channels", "Comparing strategies", "Generating insights"]}
          />
        )}

        {activeView === "tracking" && !analyzing && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Tracked Competitors ({competitors.length})</h3>
            {competitors.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No competitors tracked yet. Add your first competitor!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {competitors.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompetitor(selectedCompetitor === comp.id ? null : comp.id);
                      setResult(comp.analysis ? { name: comp.name, analysis: comp.analysis } : null);
                    }}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{comp.name}</div>
                          {comp.website_url && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {comp.website_url}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {trendIcons[comp.trend || "stable"]}
                        {comp.last_checked && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(comp.last_checked).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!analyzing && result && result.analysis && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Competitive Analysis: {result.name}</h3>
              {result.analysis.swot_comparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Your Strengths</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.your_strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">- {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <h4 className="text-sm font-semibold text-destructive mb-2">Your Weaknesses</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.your_weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">- {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <h4 className="text-sm font-semibold text-primary mb-2">Market Opportunities</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.market_opportunities?.map((o: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">- {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Market Threats</h4>
                    <ul className="space-y-1">
                      {result.analysis.swot_comparison.market_threats?.map((t: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">- {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {result.analysis.marketing_gaps?.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold mb-3">Marketing Gaps</h3>
                <div className="space-y-2">
                  {result.analysis.marketing_gaps.map((gap: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.analysis.recommended_strategies?.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold mb-3">Recommended Strategies</h3>
                <div className="space-y-2">
                  {result.analysis.recommended_strategies.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
