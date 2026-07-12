"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function CampaignsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [objective, setObjective] = useState("awareness");
  const [budget, setBudget] = useState("1000");
  const [duration, setDuration] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.campaigns.generate({
        business_id: businessId,
        objective,
        budget: parseFloat(budget),
        duration: parseInt(duration),
        platforms: ["instagram", "facebook", "linkedin"],
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
          <h2 className="text-2xl font-bold">Campaign Builder</h2>
          <p className="text-muted-foreground">AI-powered campaign strategy and planning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Campaign Objective</h3>
              <div className="space-y-2">
                {["awareness", "leads", "sales", "retention"].map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setObjective(obj)}
                    className={`w-full px-3 py-2 rounded-lg text-sm text-left capitalize transition-all ${
                      objective === obj
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
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

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Duration (days)</h3>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "Building Campaign..." : "Generate Campaign"}
            </button>
          </div>

          <div className="lg:col-span-2">
            {generating && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="animate-pulse-soft text-4xl mb-4">🚀</div>
                <p className="text-muted-foreground">AI is building your campaign strategy...</p>
              </div>
            )}

            {!generating && !result && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-muted-foreground">Configure your campaign and click generate</p>
              </div>
            )}

            {!generating && result && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold text-lg mb-2">{result.name || "Campaign Strategy"}</h3>
                  {result.ai_strategy?.strategy && (
                    <p className="text-sm text-muted-foreground">{result.ai_strategy.strategy}</p>
                  )}
                </div>

                {result.kpis && Object.keys(result.kpis).length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card p-6">
                    <h3 className="font-semibold mb-3">KPIs</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.kpis).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-lg font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.content_calendar?.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card p-6">
                    <h3 className="font-semibold mb-3">Content Calendar</h3>
                    <div className="space-y-2">
                      {result.content_calendar.slice(0, 10).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm">
                          <span className="text-muted-foreground w-24">{item.date}</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{item.platform}</span>
                          <span>{item.topic || item.content_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.tasks?.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card p-6">
                    <h3 className="font-semibold mb-3">Tasks</h3>
                    <div className="space-y-2">
                      {result.tasks.map((task: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            task.priority === "high" ? "bg-red-500" :
                            task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                          <div>
                            <div className="text-sm font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground">{task.description}</div>
                            )}
                          </div>
                        </div>
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
