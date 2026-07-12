"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      const data = await api.businesses.get("default", id);
      setBusiness(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout businessId={id}>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout businessId={id}>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Business not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout businessId={id}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{business.name}</h2>
            <p className="text-muted-foreground">{business.industry}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{business.marketing_score}</div>
              <div className="text-xs text-muted-foreground">Marketing Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-2">Target Audience</h3>
            <p className="text-sm text-muted-foreground">{business.target_audience || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-2">Budget</h3>
            <p className="text-sm text-muted-foreground">{business.budget_range || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-2">Brand Voice</h3>
            <p className="text-sm text-muted-foreground capitalize">{business.brand_voice || "Professional"}</p>
          </div>
        </div>

        {business.description && (
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{business.description}</p>
          </div>
        )}

        {business.products && business.products.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="font-semibold mb-2">Products & Services</h3>
            <div className="flex flex-wrap gap-2">
              {business.products.map((product: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm">
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
