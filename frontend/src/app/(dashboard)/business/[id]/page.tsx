"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Lightbulb } from "lucide-react";

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { organizationId, initialize } = useAuthStore();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    loadBusiness();
  }, [id, organizationId]);

  const loadBusiness = async () => {
    try {
      let orgId = organizationId;
      if (!orgId) {
        orgId = localStorage.getItem("organization_id");
      }
      if (!orgId) {
        setLoading(false);
        return;
      }
      const data = await api.businesses.get(orgId, id);
      setBusiness(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Business not found</p>
      </div>
    );
  }

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{business.name}</h2>
            <p className="text-muted-foreground">{business.industry}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {business.marketing_score}
              </div>
              <div className="text-xs text-muted-foreground">
                Marketing Score
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Target Audience</h3>
            <p className="text-sm text-muted-foreground">
              {business.target_audience || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Budget</h3>
            <p className="text-sm text-muted-foreground">
              {business.budget_range || "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Brand Voice</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {business.brand_voice || "Professional"}
            </p>
          </div>
        </div>

        {business.description && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">
              {business.description}
            </p>
          </div>
        )}

        {business.products && business.products.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Products & Services</h3>
            <div className="flex flex-wrap gap-2">
              {business.products.map((product: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-muted text-sm"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {business.business_analysis && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">AI Business Analysis</h3>
            {business.business_analysis.recommendations && (
              <div className="space-y-2">
                {business.business_analysis.recommendations.map(
                  (rec: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                    >
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
  );
}
