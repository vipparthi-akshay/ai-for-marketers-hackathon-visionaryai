"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const businesses = await api.businesses.list("default");
      if (businesses && businesses.length > 0) {
        const b = businesses[0] as any;
        const data = await api.analytics.dashboard(b.id);
        setDashboard(data);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to MarketPilot AI</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Set up your business profile and let AI build your entire marketing operation.
          </p>
          <button
            onClick={() => router.push("/business/new")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Set Up Your Business
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Your marketing at a glance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Marketing Score"
            value={`${dashboard.marketing_score}/100`}
            icon="📊"
            color="purple"
          />
          <MetricCard
            title="Active Campaigns"
            value={dashboard.campaign_count.toString()}
            icon="🚀"
            color="blue"
          />
          <MetricCard
            title="Content Pieces"
            value={dashboard.content_count.toString()}
            icon="✍️"
            color="green"
          />
          <MetricCard
            title="Predicted ROI"
            value={`${dashboard.roi_prediction}x`}
            icon="📈"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4">Growth Trend</h3>
            <div className="flex items-end gap-2 h-48">
              {dashboard.growth_trend.map((item: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-md transition-all"
                    style={{ height: `${(item.value / 35000) * 100}%`, minHeight: "8px" }}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {Object.entries(dashboard.conversion_funnel).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                  <span className="font-medium">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-semibold mb-4">AI Suggestions</h3>
          <div className="space-y-3">
            {dashboard.ai_suggestions.map((suggestion: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-primary mt-0.5">💡</span>
                <span className="text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboard.recent_activity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {activity.type === "content" ? "✍️" : activity.type === "campaign" ? "🚀" : "🔍"}
                  </span>
                  <span className="text-sm">{activity.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
    green: "from-green-500/10 to-green-500/5 border-green-500/20",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-6 card-hover ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
