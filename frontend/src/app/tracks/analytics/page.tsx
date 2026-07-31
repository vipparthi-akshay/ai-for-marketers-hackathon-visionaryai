"use client";

import { useState } from "react";
import TrackPage from "@/components/TrackPage";
import { DollarSign, Users, MousePointerClick, ShoppingBag, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

type Day = { day: string; visitors: number; conversions: number };

const DAILY: Day[] = [
  { day: "Mon", visitors: 420, conversions: 32 },
  { day: "Tue", visitors: 510, conversions: 41 },
  { day: "Wed", visitors: 480, conversions: 39 },
  { day: "Thu", visitors: 590, conversions: 47 },
  { day: "Fri", visitors: 550, conversions: 52 },
  { day: "Sat", visitors: 620, conversions: 58 },
  { day: "Sun", visitors: 530, conversions: 44 },
];

const SEGMENTS = [
  { name: "New visitors", visitors: 2100, conversion: 6.2, revenue: 14200 },
  { name: "Returning visitors", visitors: 900, conversion: 12.4, revenue: 18100 },
  { name: "Email subscribers", visitors: 620, conversion: 15.1, revenue: 15400 },
  { name: "Cart abandoners", visitors: 380, conversion: 4.2, revenue: 2600 },
  { name: "High-value customers", visitors: 140, conversion: 24.8, revenue: 19800 },
];

function fmtCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function Analytics() {
  const [visitors, setVisitors] = useState(3700);
  const [orders, setOrders] = useState(313);
  const [revenue, setRevenue] = useState(70100);
  const [prevRevenue, setPrevRevenue] = useState(61200);

  const convRate = visitors > 0 ? (orders / visitors) * 100 : 0;
  const aov = orders > 0 ? revenue / orders : 0;
  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxVisitors = Math.max(...DAILY.map((d) => d.visitors));

  const insights: string[] = [];
  if (revenueChange > 0) insights.push(`Revenue is up ${revenueChange.toFixed(1)}% vs. last period. Continue scaling the channels driving the growth.`);
  else insights.push(`Revenue is down ${Math.abs(revenueChange).toFixed(1)}% vs. last period. Review campaign performance and offers.`);

  const best = SEGMENTS.reduce((a, b) => (a.conversion > b.conversion ? a : b));
  insights.push(`"${best.name}" converts at ${best.conversion}% — more than double the average. Prioritize this segment in your next campaign.`);
  insights.push(`Average order value is ${fmtCurrency(aov)}. Bundle offers above this price point to raise total revenue per order.`);

  return (
    <TrackPage
      badge="Track 4"
      title="Customer Insights & Analytics"
      description="Track your funnel, analyze segment performance, and get recommendations that drive marketing decisions."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: Users, label: "Visitors", value: visitors.toLocaleString(), input: true },
          { icon: ShoppingBag, label: "Orders", value: orders.toLocaleString(), input: true },
          { icon: DollarSign, label: "Revenue", value: fmtCurrency(revenue), input: true },
          { icon: MousePointerClick, label: "Conversion Rate", value: `${convRate.toFixed(2)}%` },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <m.icon className="h-4 w-4 text-primary mb-2" />
            {m.input ? (
              <input
                type="number"
                value={m.value}
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  if (m.label === "Visitors") setVisitors(v);
                  if (m.label === "Orders") setOrders(v);
                  if (m.label === "Revenue") setRevenue(v);
                }}
                className="w-full bg-transparent text-lg font-semibold focus:outline-none border-b border-border"
              />
            ) : (
              <div className="text-lg font-semibold">{m.value}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Trend</h3>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                revenueChange >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {revenueChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {revenueChange >= 0 ? "+" : ""}
              {revenueChange.toFixed(1)}% vs last period
            </span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {DAILY.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-muted-foreground">{d.conversions}</div>
                <div
                  className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                />
                <div className="text-[10px] text-muted-foreground">{d.day}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Visitors per day · conversions labeled above bars</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Segment Performance</h3>
          <div className="space-y-4">
            {SEGMENTS.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {s.conversion}% · {fmtCurrency(s.revenue)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(s.conversion / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/30 bg-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {insights.map((r, i) => (
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
