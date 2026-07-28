"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { DashboardSkeleton } from "@/components/shared/Skeletons";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useUIStore } from "@/stores/uiStore";
import { useBusinesses, useDashboard } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Rocket, Pen, TrendingUp, Lightbulb, Search,
  ChevronDown, Plus, ArrowUpRight, ArrowDownRight,
  Target, Clock, PenTool, Megaphone,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const growthData = [
  { month: "Jan", value: 12400, prev: 10200 },
  { month: "Feb", value: 15800, prev: 12400 },
  { month: "Mar", value: 14200, prev: 15800 },
  { month: "Apr", value: 18900, prev: 14200 },
  { month: "May", value: 22100, prev: 18900 },
  { month: "Jun", value: 28700, prev: 22100 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { organizationId, setUser, setOrganizationId, initialize } = useAuthStore();
  const { businesses, activeBusiness, setBusinesses, setActiveBusiness } = useBusinessStore();
  const { addToast } = useUIStore();
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);

  const { data: bizList, isLoading: bizLoading } = useBusinesses(organizationId);
  const { data: dashboard, isLoading: dashLoading } = useDashboard(activeBusiness?.id || null);

  const loading = bizLoading || dashLoading;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (bizList && bizList.length > 0) {
      setBusinesses(bizList);
      if (!activeBusiness) {
        setActiveBusiness(bizList[0]);
      }
    }
  }, [bizList]);

  useEffect(() => {
    if (!organizationId) {
      const stored = localStorage.getItem("organization_id");
      if (stored) setOrganizationId(stored);
    }
  }, [organizationId, setOrganizationId]);

  const switchBusiness = (biz: any) => {
    setActiveBusiness(biz);
    setShowBusinessPicker(false);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!activeBusiness || businesses.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-4 text-muted-foreground">
            <Rocket className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to MarketPilot AI</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Set up your business profile and let AI build your entire marketing operation.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Set Up Your Business
          </button>
        </div>
    );
  }

  const score = dashboard?.marketing_score || 72;
  const scoreTrend = 8;
  const funnelEntries = dashboard?.conversion_funnel ? Object.entries(dashboard.conversion_funnel) : [["visitors", 12500], ["leads", 3200], ["proposals", 840], ["customers", 210]];

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              {activeBusiness.name} — Your marketing at a glance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {businesses.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowBusinessPicker(!showBusinessPicker)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {activeBusiness.name[0]}
                  </div>
                  {activeBusiness.name}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {showBusinessPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full mt-1 right-0 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    {businesses.map((biz) => (
                      <button
                        key={biz.id}
                        onClick={() => switchBusiness(biz)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted transition-colors",
                          biz.id === activeBusiness.id ? "bg-primary/10 text-primary" : ""
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {biz.name[0]}
                        </div>
                        <div>
                          <div className="font-medium">{biz.name}</div>
                          <div className="text-xs text-muted-foreground">{biz.industry}</div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowBusinessPicker(false); router.push("/onboarding"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted transition-colors border-t border-border text-muted-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Business
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-lg border border-border bg-card overflow-hidden"
        >
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <ScoreRing score={score} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">Your marketing health is <span className="text-primary">{score}/100</span></h3>
              <p className="text-muted-foreground text-sm mb-4">
                {score >= 70
                  ? "Your marketing strategy is performing well. Keep it up!"
                  : "There's room for improvement. Check AI suggestions below."}
              </p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-4 w-4" />
                  +{scoreTrend}% from last month
                </span>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-center gap-2 text-center">
              <div className="text-3xl font-bold">{dashboard?.roi_prediction || "3.2"}x</div>
              <div className="text-xs text-muted-foreground">Predicted ROI</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Campaigns", value: dashboard?.campaign_count || 5, icon: Rocket, trend: "+2", up: true },
            { label: "Content Pieces", value: dashboard?.content_count || 24, icon: Pen, trend: "+6", up: true },
            { label: "Website Traffic", value: "12.5K", icon: TrendingUp, trend: "+18%", up: true },
            { label: "Conversion Rate", value: "4.2%", icon: Target, trend: "-0.3%", up: false },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                className="rounded-lg border border-border bg-card p-4 cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </motion.div>
            );
          })}
        </div>

        <QuickActions businessId={activeBusiness.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Growth Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                {funnelEntries.map(([key, value], i) => {
                  const maxVal = funnelEntries[0][1] as number;
                  const pct = ((value as number) / maxVal) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                        <span className="text-xs font-medium">{(value as number).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">AI Priority Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(87 / 100) * 314} 314`}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">87</span>
                    <span className="text-[10px] text-muted-foreground">priority</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">Focus on content creation this week for maximum impact.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              AI Suggestions
            </h3>
            <div className="space-y-3">
              {(dashboard?.ai_suggestions || [
                "Create 3 more blog posts targeting high-intent keywords",
                "Run A/B test on your latest email campaign subject lines",
                "Optimize your Google Ads budget by reallocating from underperformers",
              ]).map((suggestion: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm flex-1">{suggestion}</span>
                  <span className={cn(
                    "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full",
                    i === 0 ? "bg-destructive/10 text-destructive" : i === 1 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-1">
              {(dashboard?.recent_activity || [
                { type: "content", title: "Blog post generated", time: "2 hours ago" },
                { type: "campaign", title: "Summer Sale campaign created", time: "5 hours ago" },
                { type: "seo", title: "SEO audit completed", time: "Yesterday" },
                { type: "content", title: "Social media posts scheduled", time: "Yesterday" },
                { type: "campaign", title: "Email campaign sent to 2.4K contacts", time: "2 days ago" },
              ]).map((activity: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    activity.type === "content" ? "bg-primary/10" : activity.type === "campaign" ? "bg-primary/10" : "bg-emerald-500/10"
                  )}>
                    {activity.type === "content" ? (
                      <PenTool className="h-4 w-4 text-primary" />
                    ) : activity.type === "campaign" ? (
                      <Megaphone className="h-4 w-4 text-primary" />
                    ) : (
                      <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <span className="text-sm flex-1">{activity.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative">
      <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" opacity={0.3} />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${animatedProgress} ${circumference}`}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-primary">{score}</span>
        <span className="text-xs text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}
