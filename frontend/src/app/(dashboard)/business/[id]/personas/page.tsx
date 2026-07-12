"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function PersonasPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [generating, setGenerating] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.personas.generate({ business_id: businessId });
      setPersonas(data.personas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Customer Personas</h2>
            <p className="text-muted-foreground">AI-generated audience personas</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Personas"}
          </button>
        </div>

        {generating && (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <div className="animate-pulse-soft text-4xl mb-4">👥</div>
            <p className="text-muted-foreground">AI is creating your customer personas...</p>
          </div>
        )}

        {!generating && personas.length === 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-muted-foreground">Generate personas to understand your audience</p>
          </div>
        )}

        {!generating && personas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {persona.name?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{persona.name}</h3>
                    <p className="text-xs text-muted-foreground">{persona.job_title}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Age:</span>
                    <span>{persona.age_range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Income:</span>
                    <span>{persona.income_range}</span>
                  </div>

                  {persona.pain_points?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Pain Points:</div>
                      <div className="space-y-1">
                        {persona.pain_points.slice(0, 3).map((p: string, j: number) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="text-red-500 text-xs mt-0.5">•</span>
                            <span className="text-xs">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {persona.preferred_channels?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground mb-1">Channels:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {persona.preferred_channels.map((ch: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{ch}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
