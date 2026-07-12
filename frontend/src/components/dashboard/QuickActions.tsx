"use client";

import { useRouter } from "next/navigation";

const quickActions = [
  { label: "Generate Content", icon: "✍️", href: "/content" },
  { label: "Build Campaign", icon: "🚀", href: "/campaigns" },
  { label: "Run SEO Audit", icon: "🔍", href: "/seo" },
  { label: "Create Ads", icon: "📢", href: "/ads" },
  { label: "Analyze Competitor", icon: "🏢", href: "/competitors" },
  { label: "Generate Personas", icon: "👥", href: "/personas" },
];

interface QuickActionsProps {
  businessId: string;
}

export function QuickActions({ businessId }: QuickActionsProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(`/business/${businessId}${action.href}`)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-all card-hover"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs text-center font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
