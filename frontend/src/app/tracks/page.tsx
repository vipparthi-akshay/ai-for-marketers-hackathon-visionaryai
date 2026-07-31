"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Bot, TrendingUp, Zap, BarChart3, Target, ArrowLeft } from "lucide-react";
import { getSession, type Registration } from "@/lib/auth";

const TRACKS = [
  {
    icon: Bot,
    title: "AI Content Engine",
    desc: "Automate blogs, ads, social media, and SEO content.",
    href: "/tracks/content-engine",
    accent: "from-purple-500/20 to-blue-500/10",
  },
  {
    icon: TrendingUp,
    title: "AI Ads Optimization",
    desc: "Build systems that optimize ad spend and targeting.",
    href: "/tracks/ads-optimizer",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: Zap,
    title: "Marketing Automation",
    desc: "Create end-to-end campaign automation.",
    href: "/tracks/marketing-automation",
    accent: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Customer Insights & Analytics",
    desc: "Predict behavior, segment audiences, and generate insights.",
    href: "/tracks/analytics",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Target,
    title: "Personalization Engines",
    desc: "Deliver one to one personalized experiences at scale.",
    href: "/tracks/personalization",
    accent: "from-pink-500/20 to-rose-500/10",
  },
];

export default function Tracks() {
  const router = useRouter();
  const [account, setAccount] = useState<Registration | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/signin");
    } else {
      setAccount(session);
    }
  }, [router]);

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="gradient-glow fixed inset-0 pointer-events-none" />

      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-4 mt-3 md:mx-8">
            <div className="glass rounded-lg border border-white/5 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display text-sm font-semibold hidden sm:block">AI for Marketers Hackathon</span>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-28 md:pt-36 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Hackathon Tracks
              </span>
              <h1 className="font-display text-3xl font-bold mt-4 md:text-4xl">Choose Your Challenge</h1>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Five tracks to build AI-powered marketing solutions that solve real business problems.
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Signed in as <span className="text-foreground font-medium">{account.teamName}</span> — pick a tool to start solving.
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {TRACKS.map((track) => (
                <Link
                  key={track.title}
                  href={track.href}
                  className={`relative rounded-xl border border-border bg-card p-7 card-hover overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${track.accent} opacity-50`} />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <track.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {track.title}
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{track.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Open Tool
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
