"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

const contentTypes = [
  { id: "blog", label: "Blog Article", icon: "📝" },
  { id: "instagram_post", label: "Instagram Post", icon: "📸" },
  { id: "linkedin_post", label: "LinkedIn Post", icon: "💼" },
  { id: "facebook_post", label: "Facebook Post", icon: "👥" },
  { id: "twitter_thread", label: "Twitter/X Thread", icon: "🐦" },
  { id: "email", label: "Email Campaign", icon: "📧" },
  { id: "product_description", label: "Product Description", icon: "🏷️" },
  { id: "ad_copy", label: "Ad Copy", icon: "📢" },
  { id: "video_script", label: "Video Script", icon: "🎬" },
  { id: "landing_page", label: "Landing Page", icon: "🌐" },
];

const tones = ["Professional", "Casual", "Friendly", "Bold", "Witty", "Luxury"];

export default function ContentPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [selectedType, setSelectedType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.content.generate({
        business_id: businessId,
        asset_type: selectedType,
        platform: selectedType.includes("instagram") ? "instagram" :
                  selectedType.includes("linkedin") ? "linkedin" :
                  selectedType.includes("facebook") ? "facebook" :
                  selectedType.includes("twitter") ? "twitter" : "general",
        tone: tone.toLowerCase(),
        topic,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Content Engine</h2>
          <p className="text-muted-foreground">Generate marketing content with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Content Type</h3>
              <div className="space-y-1.5">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      selectedType === type.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Tone</h3>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      tone === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h3 className="font-semibold mb-3">Topic / Focus</h3>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                placeholder="What should the content be about?"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Content"}
            </button>
          </div>

          <div className="lg:col-span-2">
            {generating && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="animate-pulse-soft text-4xl mb-4">✍️</div>
                <p className="text-muted-foreground">AI is crafting your content...</p>
              </div>
            )}

            {!generating && !result && (
              <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-muted-foreground">Select a content type and click generate</p>
              </div>
            )}

            {!generating && result && (
              <div className="space-y-4">
                <h3 className="font-semibold">
                  Generated Variations ({result.variations?.length || 0})
                </h3>
                {result.variations?.map((v: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Variation {String.fromCharCode(65 + i)}
                      </span>
                      {v.engagement_prediction && (
                        <span className="text-xs text-muted-foreground">
                          Predicted engagement: {v.engagement_prediction}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold mb-2">{v.title}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{v.content}</p>
                    {v.hashtags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {v.hashtags.map((tag: string, j: number) => (
                          <span key={j} className="text-xs text-primary">#{tag}</span>
                        ))}
                      </div>
                    )}
                    {v.call_to_action && (
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">CTA: </span>
                        <span className="font-medium">{v.call_to_action}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
