"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/uiStore";
import { api } from "@/lib/api";
import { useDashboard, usePredictROI } from "@/lib/hooks";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Target, Rocket, Pen, Lightbulb, Clock, BarChart3, Search,
  DollarSign, Users, Eye, Sparkles, RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const { data: dashboard, isLoading: dashLoading } = useDashboard(businessId);
  const predictROI = usePredictROI();
  const [roiPrediction, setRoiPrediction] = useState<any>(null);

  const handlePredictROI = async () => {
    try {
      const data = await predictROI.mutateAsync({ business_id: businessId, period: "6_months" });
      setRoiPrediction(data);
      addToast("ROI prediction generated!", "success");
    } catch {
      addToast("Prediction failed", "error");
    }
  };

  if (dashLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-xl" />
          <div className="h-80 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const score = dashboard?.marketing_score || 72;
  const stats = [
    { label: "Marketing Score", value: `${score}/100`, icon: BarChart3, color: "text-primary", trend: "+8%", up: true },
    { label: "Active Campaigns", value: dashboard?.campaign_count || 5, icon: Rocket, color: "text-blue-500", trend: "+2", up: true },
    { label: "Content Pieces", value: dashboard?.content_count || 24, icon: Pen, color: "text-emerald-500", trend: "+6", up: true },
    { label: "Predicted ROI", value: `${dashboard?.roi_prediction || "3.2"}x`, icon: DollarSign, color: "text-amber-500", trend: "+12%", up: true },
  ];

  const funnelEntries = dashboard?.conversion_funnel
    ? Object.entries(dashboard.conversion_funnel)
    : [["visitors", 12500], ["leads", 3200], ["proposals", 840], ["customers", 210]];

  const growthData = dashboard?.growth_trend || [
    { month: "Jan", value: 12400 }, { month: "Feb", value: 15800 }, { month: "Mar", value: 14200 },
    { month: "Apr", value: 18900 }, { month: "May", value: 22100 }, { month: "Jun", value: 28700 },
  ];

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <PageHeader title="Analytics Dashboard" description="Performance insights and ROI predictions" />
          <Button onClick={handlePredictROI} loading={predictROI.isPending} variant="outline" icon={<Sparkles className="h-4 w-4" />}>
            Predict ROI
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} hoverable>
                <CardContent className="py-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${stat.up ? "text-emerald-600" : "text-destructive"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend} from last month
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Growth Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {growthData.map((item: any, i: number) => {
                  const maxVal = Math.max(...growthData.map((t: any) => t.value));
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value?.toLocaleString()}
                      </div>
                      <div className="w-full bg-primary rounded-t-md transition-all duration-500 hover:bg-primary/80"
                        style={{ height: `${pct}%`, minHeight: "8px" }} />
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelEntries.map(([key, value], i) => {
                  const maxVal = funnelEntries[0][1] as number;
                  const pct = ((value as number) / maxVal) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-muted-foreground">{key}</span>
                        <span className="font-medium">{(value as number).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {roiPrediction && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ROI Prediction</CardTitle>
                <Badge variant="success" size="md">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-3xl font-bold text-primary">{roiPrediction.predicted_roi || "3.5"}x</div>
                  <div className="text-xs text-muted-foreground">Predicted ROI</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-3xl font-bold">{roiPrediction.recommended_budget || "₹5,000"}</div>
                  <div className="text-xs text-muted-foreground">Recommended Budget</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <div className="text-3xl font-bold">{roiPrediction.timeline || "6 months"}</div>
                  <div className="text-xs text-muted-foreground">Expected Timeline</div>
                </div>
              </div>
              {roiPrediction.insights?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {roiPrediction.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />AI Suggestions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dashboard?.ai_suggestions || [
                  "Create 3 more blog posts targeting high-intent keywords",
                  "Run A/B test on email campaign subject lines",
                  "Reallocate Google Ads budget from underperformers",
                ]).map((suggestion: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm flex-1">{suggestion}</span>
                    <Badge variant={i === 0 ? "error" : i === 1 ? "warning" : "success"} size="sm">
                      {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {(dashboard?.recent_activity || [
                  { type: "content", title: "Blog post generated", time: "2 hours ago" },
                  { type: "campaign", title: "Summer Sale campaign created", time: "5 hours ago" },
                  { type: "seo", title: "SEO audit completed", time: "Yesterday" },
                  { type: "content", title: "Social media posts scheduled", time: "Yesterday" },
                ]).map((activity: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.type === "content" ? "bg-primary/10" : activity.type === "campaign" ? "bg-blue-500/10" : "bg-emerald-500/10"
                    }`}>
                      {activity.type === "content" ? <Pen className="h-4 w-4 text-primary" /> :
                       activity.type === "campaign" ? <Rocket className="h-4 w-4 text-blue-500" /> :
                       <Search className="h-4 w-4 text-emerald-600" />}
                    </div>
                    <span className="text-sm flex-1">{activity.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}


