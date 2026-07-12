"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [businessId]);

  const loadAnalytics = async () => {
    try {
      const result = await api.analytics.dashboard(businessId);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout businessId={businessId}>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Performance insights and ROI predictions</p>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="text-sm text-muted-foreground mb-1">Marketing Score</div>
                <div className="text-3xl font-bold gradient-text">{data.marketing_score}/100</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="text-sm text-muted-foreground mb-1">Active Campaigns</div>
                <div className="text-3xl font-bold">{data.campaign_count}</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="text-sm text-muted-foreground mb-1">Content Pieces</div>
                <div className="text-3xl font-bold">{data.content_count}</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <div className="text-sm text-muted-foreground mb-1">Predicted ROI</div>
                <div className="text-3xl font-bold text-green-500">{data.roi_prediction}x</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-4">Growth Trend</h3>
                <div className="flex items-end gap-2 h-48">
                  {data.growth_trend?.map((item: any, i: number) => {
                    const maxVal = Math.max(...data.growth_trend.map((t: any) => t.value));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-md"
                          style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: "8px" }}
                        />
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-4">Conversion Funnel</h3>
                <div className="space-y-4">
                  {data.conversion_funnel && Object.entries(data.conversion_funnel).map(([key, value]: [string, any], i: number) => {
                    const maxVal = Math.max(...Object.values(data.conversion_funnel) as number[]);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="capitalize text-muted-foreground">{key}</span>
                          <span className="font-medium">{value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                            style={{ width: `${(value / maxVal) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="font-semibold mb-4">AI Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.ai_suggestions?.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-primary">💡</span>
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
