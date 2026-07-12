"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

export default function ContentGeneratePage() {
  const params = useParams();
  const businessId = params.id as string;
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("blog");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const platforms = [
    { id: "blog", label: "Blog Post" },
    { id: "instagram", label: "Instagram" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "facebook", label: "Facebook" },
    { id: "twitter", label: "Twitter/X" },
    { id: "email", label: "Email" },
    { id: "ad", label: "Ad Copy" },
  ];

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Generate Content</h2>
          <p className="text-muted-foreground">Quick content generation for any platform</p>
        </div>

        <div className="max-w-3xl space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    platform === p.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">What should the content be about?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring h-32 resize-none"
              placeholder="e.g., Announce our new summer sale with 30% off all products..."
            />
          </div>

          <button
            onClick={async () => {
              if (!content.trim()) return;
              setGenerating(true);
              try {
                const data = await api.content.generate({
                  business_id: businessId,
                  asset_type: platform === "blog" ? "blog" : platform === "ad" ? "ad_copy" : `${platform}_post`,
                  platform,
                  topic: content,
                  tone: "professional",
                });
                setResult(data);
              } catch (err) {
                console.error(err);
              } finally {
                setGenerating(false);
              }
            }}
            disabled={!content.trim() || generating}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Content"}
          </button>

          {result && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">Generated Content</h3>
              {result.variations?.map((v: any, i: number) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Variation {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <h4 className="font-medium mb-2">{v.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.content}</p>
                  {v.hashtags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {v.hashtags.map((tag: string, j: number) => (
                        <span key={j} className="text-xs text-primary">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
