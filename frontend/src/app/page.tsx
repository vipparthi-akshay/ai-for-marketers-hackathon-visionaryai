"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession, type Registration } from "@/lib/auth";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Sparkles, Zap, Target, Bot, BarChart3, Users, Trophy,
  ChevronRight, Globe, TrendingUp, Cpu, Layers, Rocket,
  Star, Menu, X, ArrowRight, Clock, Shield, Database,
  Mail, Search, Workflow, Split, Lock, Check, Gauge,
} from "lucide-react";

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}

function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForced(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return { ref, visible: isInView || forced };
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}

function SectionHeading({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-14">
      <Badge>{badge}</Badge>
      <h2 className="font-display text-3xl font-bold mt-4 md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [account, setAccount] = useState<Registration | null>(null);
  const router = useRouter();

  useEffect(() => {
    setAccount(getSession());
  }, []);

  const goToRegister = () => router.push("/register");

  const handleSignOut = () => {
    clearSession();
    setAccount(null);
    setMobileOpen(false);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); }
    setMobileOpen(false);
  };

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
                <span className="font-display text-sm font-semibold hidden sm:block">MarketGenius AI</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                {["Features", "How It Works", "Platform", "Technology", "FAQ"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item.toLowerCase().replace(/\s/g, "-"))}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                {account ? (
                  <>
                    <Link
                      href="/tracks"
                      className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Launch Platform
                    </Link>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {account.teamName.slice(0, 1).toUpperCase()}
                      </span>
                      <span>{account.teamName}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors hidden sm:block"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/signin")}
                      className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors hidden sm:block"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={goToRegister}
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors hidden sm:block"
                    >
                      Get Started
                    </button>
                  </>
                )}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" aria-label="Menu">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mx-4 md:mx-8 overflow-hidden"
              >
                <div className="glass rounded-lg border border-white/5 px-5 py-4 mt-1 space-y-2">
                  {["Features", "How It Works", "Platform", "Technology", "FAQ"].map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollTo(item.toLowerCase().replace(/\s/g, "-"))}
                      className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2"
                    >
                      {item}
                    </button>
                  ))}
                  {account ? (
                    <>
                      <Link
                        href="/tracks"
                        className="block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center"
                      >
                        Launch Platform
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {account.teamName.slice(0, 1).toUpperCase()}
                        </span>
                        <span>{account.teamName}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setMobileOpen(false); router.push("/signin"); }}
                        className="block w-full rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={goToRegister}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero */}
        <section className="relative pt-36 pb-20 md:pt-44 md:pb-28">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Badge>AI-Powered Marketing Automation Platform</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
            >
              Marketing Automation,{" "}
              <span className="gradient-text">Powered by AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              MarketGenius AI is a production-ready platform that generates content, automates campaigns,
              personalizes customer journeys, and optimizes conversions — so your team can focus on growth,
              not repetitive work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={goToRegister}
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollTo("features")}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Layers className="h-4 w-4" />
                Explore Features
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { icon: Layers, label: "20+ Marketing Tools" },
                { icon: Cpu, label: "4 AI Models" },
                { icon: Globe, label: "50+ Languages" },
                { icon: Clock, label: "24/7 Automation" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem */}
        <Section className="bg-muted/30 border-y border-border">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="The Challenge"
              title="Marketing Teams Are Stretched Thin"
              subtitle="Modern marketing demands more channels, more content, and faster iteration than any team can deliver manually."
            />
            <StaggerContainer className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Clock, title: "Content Bottlenecks", desc: "Writing blogs, ads, emails, and social posts for every channel consumes hours of every day." },
                { icon: Split, title: "Fragmented Campaigns", desc: "Orchestrating multi-channel campaigns without automation leads to inconsistent messaging and missed follow-ups." },
                { icon: BarChart3, title: "Guesswork Optimization", desc: "Without real-time data, teams struggle to attribute results and optimize spend effectively." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="h-full rounded-xl border border-border bg-card p-6 card-hover text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* The Project */}
        <Section id="the-project">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="The Project"
              title="Real-World AI Marketing Solutions"
              subtitle="Create real-world marketing solutions using AI that businesses can deploy immediately."
            />
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <p className="text-muted-foreground mb-6">
                By the end of the hackathon, teams must deliver:
              </p>
              <StaggerContainer className="space-y-4">
                {[
                  { icon: Rocket, text: "A working AI-powered marketing tool or platform" },
                  { icon: Workflow, text: "Campaign automation workflows" },
                  { icon: Bot, text: "AI-generated content assets" },
                  { icon: BarChart3, text: "Analytics dashboards or insights engine" },
                  { icon: Star, text: "Demo-ready product" },
                ].map((item) => (
                  <StaggerItem key={item.text}>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 card-hover">
                      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{item.text}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        </Section>

        {/* AI-Driven Marketing */}
        <Section id="ai-marketing" className="bg-muted/30 border-y border-border">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="AI-Driven Marketing"
              title="What AI Makes Possible"
              subtitle="Marketing is being rewritten by AI. These are the capabilities that separate modern teams from the rest."
            />
            <StaggerContainer className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Bot, title: "Content Creation Powered by AI", desc: "High-quality marketing copy, blogs, social posts, and ad creatives generated at scale." },
                { icon: Target, title: "Hyper-Personalization at Scale", desc: "Personalized experiences for every customer segment, powered by behavioral AI." },
                { icon: Cpu, title: "Automated Decision-Making", desc: "Real-time decisions on campaign optimization, budget allocation, and targeting." },
                { icon: TrendingUp, title: "Real-Time Campaign Optimization", desc: "Continuously optimize campaigns based on performance data and AI recommendations." },
                { icon: BarChart3, title: "Data-Driven Growth", desc: "Every decision backed by data — AI analyzes patterns, predicts outcomes, and drives measurable growth." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="flex gap-4 p-5 rounded-xl border border-border bg-card card-hover">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* Features */}
        <Section id="features">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Platform"
              title="Everything Your Marketing Team Needs"
              subtitle="A complete suite of AI-powered tools built for modern marketing teams — from content creation to conversion optimization."
            />

            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Bot, title: "AI Content Generation", desc: "Generate blogs, ad copy, social posts, emails, and SEO content from a simple brief in seconds." },
                { icon: Workflow, title: "Campaign Builder", desc: "Design multi-channel campaigns with visual orchestration and intelligent scheduling." },
                { icon: Zap, title: "Marketing Automation", desc: "Trigger-based workflows that follow up, segment, and nurture contacts automatically." },
                { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time metrics, conversion tracking, and revenue insights in one view." },
                { icon: Users, title: "Customer Segmentation", desc: "Build rule-based audiences and deliver the right message to the right people." },
                { icon: Split, title: "A/B Testing", desc: "Split-test subject lines, creatives, and CTAs with statistically significant results." },
                { icon: Mail, title: "Email Marketing", desc: "Professional templates, scheduled sends, and open and click tracking." },
                { icon: Search, title: "SEO Analyzer", desc: "On-page scoring, keyword recommendations, and competitor tracking." },
                { icon: Target, title: "Personalization Engine", desc: "Deliver dynamic, segment-aware content across every touchpoint." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="h-full rounded-xl border border-border bg-card p-6 card-hover">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* How It Works */}
        <Section id="how-it-works" className="bg-muted/30 border-y border-border">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="How It Works"
              title="From Setup to Scale in Three Steps"
            />
            <StaggerContainer className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Database, title: "1. Connect Your Data", desc: "Sync your channels, audiences, and campaign history into one unified workspace." },
                { icon: Cpu, title: "2. Let AI Create", desc: "AI generates content, builds workflows, and recommends optimizations based on your goals." },
                { icon: Rocket, title: "3. Automate & Measure", desc: "Launch automated campaigns, track performance in real time, and scale what works." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="rounded-xl border border-border bg-card p-7 card-hover text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* Platform Tools */}
        <Section id="platform">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Working Tools"
              title="Launch the Platform"
              subtitle="Try the live tools we built. Each one solves a real marketing problem — no setup required."
            />
            <StaggerContainer className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Bot, title: "AI Content Engine", desc: "Automate blogs, ads, social media, and SEO content.", href: "/tracks/content-engine", gradient: "from-purple-500/20 to-blue-500/10" },
                { icon: TrendingUp, title: "AI Ads Optimization", desc: "Build systems that optimize ad spend and targeting.", href: "/tracks/ads-optimizer", gradient: "from-emerald-500/20 to-teal-500/10" },
                { icon: Zap, title: "Marketing Automation", desc: "Create end-to-end campaign automation.", href: "/tracks/marketing-automation", gradient: "from-amber-500/20 to-orange-500/10" },
                { icon: BarChart3, title: "Customer Insights & Analytics", desc: "Predict behavior, segment audiences, and generate insights.", href: "/tracks/analytics", gradient: "from-blue-500/20 to-indigo-500/10" },
                { icon: Target, title: "Personalization Engines", desc: "Deliver one to one personalized experiences at scale.", href: "/tracks/personalization", gradient: "from-pink-500/20 to-rose-500/10" },
              ].map((track) => (
                <StaggerItem key={track.title}>
                  <Link href={track.href} className={`relative block h-full rounded-xl border border-border bg-card p-7 card-hover overflow-hidden group`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-50`} />
                    <div className="relative">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <track.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        {track.title}
                        <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{track.desc}</p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* Technology */}
        <Section id="technology" className="bg-muted/30 border-y border-border">
          <FadeIn className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Technology"
              title="Built on a Modern Stack"
              subtitle="Production-grade architecture that scales from local development to enterprise deployment."
            />
            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Layers, title: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
                { icon: Workflow, title: "Backend", items: ["FastAPI", "Python", "Celery", "REST API"] },
                { icon: Database, title: "Data Layer", items: ["PostgreSQL", "Redis", "ChromaDB", "RabbitMQ"] },
                { icon: Cpu, title: "AI Models", items: ["GPT-4o", "Claude 3.5", "Gemini 1.5", "DALL-E 3"] },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="h-full rounded-xl border border-border bg-card p-6 card-hover">
                    <item.icon className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-semibold mb-3">{item.title}</h3>
                    <ul className="space-y-1.5">
                      {item.items.map((tech) => (
                        <li key={tech} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </Section>

        {/* Security */}
        <Section>
          <FadeIn className="max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: Shield, title: "Enterprise Security", desc: "JWT-based authentication, role-based access control, and strict input validation across all endpoints." },
                { icon: Lock, title: "Data Protection", desc: "Hashed credentials, encrypted API keys, and immutable audit logging for compliance-ready operations." },
                { icon: Gauge, title: "Performance", desc: "Async task orchestration with Celery and Redis-backed caching keep the platform fast at scale." },
                { icon: Star, title: "Proven Reliability", desc: "Containerized deployment with Docker, health checks, and monitoring built into every service." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="flex gap-4 p-5 rounded-xl border border-border bg-card card-hover">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </FadeIn>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="bg-muted/30 border-y border-border">
          <FadeIn className="max-w-2xl mx-auto">
            <SectionHeading
              badge="FAQ"
              title="Frequently Asked Questions"
            />
            <div className="space-y-0">
              {[
                { q: "What is MarketGenius AI?", a: "MarketGenius AI is an AI-powered marketing automation platform that generates content, automates campaigns, personalizes customer journeys, and optimizes conversions." },
                { q: "How does the AI content generation work?", a: "You provide a short brief — your product, target audience, and goal — and the engine generates blogs, ad copy, social posts, emails, and SEO meta in seconds." },
                { q: "Do I need technical skills to use it?", a: "No. The platform is designed for marketers. Workflows are visual, and content is generated from plain-language inputs." },
                { q: "Can I try the tools before registering?", a: "The live tools require an account. Registering takes less than a minute, and all core tools are available immediately." },
                { q: "Which AI models does the platform use?", a: "The platform integrates GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and DALL-E 3 for generation, analysis, and imagery." },
                { q: "How is my data protected?", a: "We use JWT authentication, role-based access, encrypted credentials, and audit logging. Your data is never exposed or sold." },
              ].map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </FadeIn>
        </Section>

        {/* CTA */}
        <Section id="register">
          <FadeIn className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-primary/30 bg-card p-10 md:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <Badge>Get Started</Badge>
                <h2 className="font-display text-3xl font-bold mt-4 mb-4 md:text-4xl">
                  Start Automating Your Marketing Today
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Create your free account and start using the full suite of AI-powered marketing tools immediately.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={goToRegister}
                    className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
                  >
                    Create Your Account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => scrollTo("platform")}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Target className="h-4 w-4" />
                    View Platform Tools
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </Section>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-display text-sm font-semibold">MarketGenius AI</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
                <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">How It Works</button>
                <button onClick={() => scrollTo("technology")} className="hover:text-foreground transition-colors">Technology</button>
                <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">FAQ</button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} MarketGenius AI. All rights reserved. Built for the AI for Marketers Hackathon.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-sm font-medium group-hover:text-primary transition-colors pr-4">{q}</span>
        <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}
