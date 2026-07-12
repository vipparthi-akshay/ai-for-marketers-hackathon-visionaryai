"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function SEOPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await api.seo.analyze({ business_id: businessId });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">SEO Engine</h2>
            <p className="text-muted-foreground">AI-powered SEO analysis and optimization</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Run SEO Audit"}
          </button>
        </div>

        {analyzing && (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <div className="animate-pulse-soft text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground">AI is analyzing your SEO...</p>
          </div>
        )}

        {!analyzing && !result && (
          <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground">Click &quot;Run SEO Audit&quot; to analyze your website</p>
          </div>
        )}

        {!analyzing && result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="text-4xl font-bold gradient-text">{result.score || 0}</div>
                <div className="text-sm text-muted-foreground">SEO Score</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="text-4xl font-bold">{result.keywords?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Keywords Found</div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="text-4xl font-bold">{result.issues?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Issues Found</div>
              </div>
            </div>

            {result.keywords?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-3">Keywords</h3>
                <div className="space-y-2">
                  {result.keywords.map((kw: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{kw.keyword}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Difficulty: {kw.difficulty}/100</span>
                        <span className="text-xs text-muted-foreground">Volume: {kw.volume}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.issues?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-3">Issues</h3>
                <div className="space-y-2">
                  {result.issues.map((issue: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          issue.severity === "high" ? "bg-red-500/10 text-red-500" :
                          issue.severity === "medium" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-green-500/10 text-green-500"
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="text-sm font-medium">{issue.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      {issue.fix && (
                        <p className="text-xs text-primary mt-1">Fix: {issue.fix}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="font-semibold mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <span className="text-primary mt-0.5">💡</span>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
