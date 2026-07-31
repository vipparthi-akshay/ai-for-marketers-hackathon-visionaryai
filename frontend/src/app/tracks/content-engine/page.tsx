"use client";

import { useState } from "react";
import TrackPage from "@/components/TrackPage";
import { Sparkles, Copy, Check, RefreshCw, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

type Tone = "professional" | "friendly" | "bold" | "witty";
type Format = "blog" | "social" | "ad" | "email" | "seo";

const TONES: Record<Tone, { opener: string; cta: string; signoff: string }> = {
  professional: {
    opener: "In today's competitive landscape",
    cta: "Schedule a call",
    signoff: "— the team that gets results",
  },
  friendly: {
    opener: "We think you'll love this",
    cta: "Give it a try",
    signoff: "— with care, from our team",
  },
  bold: {
    opener: "Stop wasting time",
    cta: "Take action now",
    signoff: "— no fluff, just results",
  },
  witty: {
    opener: "Be honest — you clicked this for a reason",
    cta: "Let's make it happen",
    signoff: "— yes, we're this good",
  },
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateContent(input: { product: string; audience: string; goal: string; tone: Tone; format: Format }) {
  const t = TONES[input.tone];
  const product = input.product.trim();
  const audience = input.audience.trim();
  const goal = input.goal.trim();

  switch (input.format) {
    case "blog":
      return {
        title: `${t.opener}: ${capitalize(product)}`,
        body: [
          `The marketing playbook is changing, and ${product} is built for marketers who move first. If you're responsible for reaching ${audience}, you already know the challenge: attention is scarce, and generic messages get ignored.`,
          `${goal}. That's exactly what ${product} helps you achieve — a focused system that turns effort into measurable progress.`,
          `In the next few paragraphs we'll cover why most teams underperform, how ${product} removes the guesswork, and the fastest way to get started. By the end, you'll know whether this is the right move for your team.`,
          `The winners in this space don't do more — they do what matters. ${product} gives ${audience} a clear path from first touch to lasting value.`,
        ].join("\n\n"),
      };
    case "social":
      return {
        title: "Social Post",
        body: [
          `${t.opener} — ${product} is here.`,
          ``,
          `Built for ${audience}. Made to help you ${goal.toLowerCase()}.`,
          ``,
          `🔗 Link in bio`,
          `#Marketing #Growth #AI`,
        ].join("\n"),
      };
    case "ad":
      return {
        title: "Ad Copy",
        body: [
          `Headline: ${t.opener} with ${capitalize(product)}`,
          ``,
          `Primary text:`,
          `${product} helps ${audience} ${goal.toLowerCase()} — without the busywork. No complex setups, no wasted spend.`,
          ``,
          `CTA: ${t.cta}`,
        ].join("\n"),
      };
    case "email":
      return {
        title: "Email Campaign",
        body: [
          `Subject: ${t.opener} — ${product} ${t.signoff.replace(/^[—\-]+\s*/, "")}`,
          ``,
          `Hi there,`,
          ``,
          `If you're part of ${audience}, this email is for you. We built ${product} to help teams like yours ${goal.toLowerCase()}, and early users are already seeing the difference.`,
          ``,
          `Here's how it works in three steps:`,
          `1. Connect your goals.`,
          `2. Let ${product} do the heavy lifting.`,
          `3. Measure the impact and scale what works.`,
          ``,
          `${t.cta} today.`,
          ``,
          `${t.signoff}`,
        ].join("\n"),
      };
    case "seo":
      return {
        title: "SEO Meta + Description",
        body: [
          `Meta title: ${capitalize(product)} for ${capitalize(audience)} — ${goal}`,
          ``,
          `Meta description:`,
          `Discover how ${product} helps ${audience} ${goal.toLowerCase()}. Get started in minutes with a solution designed for real results.`,
          ``,
          `Keywords: ${product}, ${audience}, ${goal.toLowerCase()}, marketing automation, growth`,
        ].join("\n"),
      };
  }
}

export default function ContentEngine() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [format, setFormat] = useState<Format>("blog");
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<{ title: string; body: string }[]>([]);
  const [error, setError] = useState("");

  const generate = () => {
    setError("");
    if (!product.trim() || !audience.trim() || !goal.trim()) {
      setError("Please fill in the product, audience, and goal fields.");
      return;
    }
    setResult(generateContent({ product, audience, goal, tone, format }));
    setCopied(false);
  };

  const save = () => {
    if (!result) return;
    setSaved((prev) => [{ ...result }, ...prev].slice(0, 10));
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${result.title}\n\n${result.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <TrackPage
      badge="Track 1"
      title="AI Content Engine"
      description="Generate blogs, social posts, ad copy, emails, and SEO content from a few inputs — ready to publish and scale."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Product / Business *</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. A SaaS tool that auto-generates ad creatives"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Target Audience *</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. E-commerce founders with small marketing teams"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Goal *</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Increase sign-ups, drive demo bookings, boost brand awareness"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className={inputClass}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="bold">Bold</option>
                <option value="witty">Witty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className={inputClass}>
                <option value="blog">Blog Post</option>
                <option value="social">Social Post</option>
                <option value="ad">Ad Copy</option>
                <option value="email">Email Campaign</option>
                <option value="seo">SEO Meta</option>
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={generate}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Generate Content
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Output</h3>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
          {result ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-muted/20 rounded-lg p-4 flex-1">
              <span className="font-semibold">{result.title}</span>
              {"\n\n"}
              {result.body}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Your generated content will appear here.
            </div>
          )}
        </div>
      </div>

      {saved.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Saved Content
            <button onClick={() => setSaved([])} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {saved.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 text-sm">
                <div className="font-medium mb-1">{item.title}</div>
                <p className="text-muted-foreground text-xs line-clamp-3 whitespace-pre-wrap">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </TrackPage>
  );
}
