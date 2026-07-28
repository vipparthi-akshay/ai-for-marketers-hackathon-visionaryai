"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, Shield, Activity, BarChart3,
  FileText, Rocket, Search, Settings, Key, Clock, TrendingUp,
  ExternalLink, Copy,
} from "lucide-react";

const activityHistory = [
  { id: "1", action: "Generated blog post", type: "content", time: "2 hours ago", icon: FileText },
  { id: "2", action: "Created campaign", type: "campaign", time: "5 hours ago", icon: Rocket },
  { id: "3", action: "Ran SEO audit", type: "seo", time: "Yesterday", icon: Search },
  { id: "4", action: "Updated automation workflow", type: "automation", time: "Yesterday", icon: Settings },
  { id: "5", action: "Generated 3 ad creatives", type: "content", time: "2 days ago", icon: FileText },
  { id: "6", action: "Analyzed competitor", type: "seo", time: "3 days ago", icon: Search },
  { id: "7", action: "Created persona", type: "content", time: "4 days ago", icon: User },
];

const apiStats = [
  { label: "Total API Calls", value: "1,247", change: "+12% this month", icon: BarChart3, color: "emerald" },
  { label: "Content Generated", value: "89", change: "+8 this week", icon: FileText, color: "blue" },
  { label: "Campaigns Active", value: "3", change: "1 launching soon", icon: Rocket, color: "green" },
  { label: "AI Tokens Used", value: "2.4M", change: "760K remaining", icon: Key, color: "amber" },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText("mp_live_xxxxxxxxxxxxxxxx");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">View your account details and activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4">
                  {user?.full_name?.[0] || "U"}
                </div>
                <h3 className="text-lg font-bold">{user?.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email || "user@example.com"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    user?.is_verified ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}>
                    {user?.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined</span>
                  <span className="ml-auto font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Jul 2026"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role</span>
                  <span className="ml-auto font-medium">Admin</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status</span>
                  <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="font-semibold text-sm mb-4">API Key</h4>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 font-mono text-xs">
                <span className="flex-1 truncate">mp_live_xxxxxxxxxxxxxxxx</span>
                <button onClick={copyApiKey} className="shrink-0 p-1 rounded hover:bg-muted transition-colors">
                  {copied ? <span className="text-emerald-600 dark:text-emerald-400 text-xs">Copied!</span> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Use this key to access the MarketPilot API.</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {apiStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Activity History</h3>
                <button className="text-xs text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-1">
                {activityHistory.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm flex-1">{activity.action}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Settings", href: "/settings", icon: Settings },
                  { label: "Documentation", href: "#", icon: ExternalLink },
                  { label: "Change Password", href: "/settings", icon: Key },
                  { label: "API Reference", href: "#", icon: BarChart3 },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
