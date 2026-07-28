"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LandingBackground } from "@/components/backgrounds/LandingBackground";
import { LetterAnimator } from "@/components/shared/LetterAnimator";
import {
  Brain, Users, PenTool, BarChart3, Workflow, Megaphone, Search,
  Building2, LineChart, Target, ArrowRight, Sparkles, Zap, Globe,
  Check, Star, ChevronRight, Play, Rocket, Mail, Shield, Clock,
  MessageSquare, Layout, ChevronDown, Sun, Moon,
} from "lucide-react";

function AnimatedSection({
  children, className = "", delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({
  children, className = "", staggerDelay = 0.06,
}: { children: React.ReactNode; className?: string; staggerDelay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
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

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <motion.span ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      className="font-display text-4xl md:text-5xl font-bold text-foreground"
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
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

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden scroll-smooth bg-background">
      <LandingBackground />
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="hero-gradient-subtle absolute inset-0" />

          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <LetterAnimator text="AI-Powered Marketing Platform" effect="slide" tag="span" stagger={0.02} className="inline-block" />
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>

            <div className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl text-foreground">
              <LetterAnimator
                text="The Autonomous"
                effect="spring"
                tag="h1"
                delay={0.2}
                stagger={0.035}
              />
              <br />
              <LetterAnimator
                text="AI Marketing Team"
                effect="elastic"
                tag="span"
                delay={0.4}
                stagger={0.05}
                className="inline-block"
                highlightClassName="text-primary"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Enter your business once. AI automatically builds your entire marketing operation — content, SEO, ads, campaigns, analytics, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]"
              >
                Start Free — No Card Required
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/80 backdrop-blur-sm px-7 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
              >
                <Play className="h-4 w-4" />
                See How It Works
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Set up in 3 minutes
              </span>
            </motion.div>

            {/* App mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative mt-16 mx-auto max-w-4xl"
            >
              <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="ml-3 h-5 w-40 rounded bg-muted/50" />
                </div>
                <div className="p-6 md:p-8 bg-card">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-3">
                      <div className="h-24 rounded-lg bg-primary/5 border border-border" />
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 rounded-lg bg-muted/50 border border-border" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-28 rounded-lg bg-muted/30 border border-border" />
                      <div className="h-12 rounded-lg bg-muted/30 border border-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 rounded-xl bg-primary/5 blur-2xl" />
            </motion.div>
          </div>
        </section>

        {/* Social proof logos */}
        <section className="py-12 border-y border-border">
          <div className="max-w-5xl mx-auto px-6">
            <AnimatedSection>
              <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-8">
                Trusted by innovative companies
              </p>
            </AnimatedSection>
            <StaggerContainer className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {["TechFlow", "GrowthScale", "BrandForward", "NexaDigital", "CloudSpark", "PixelCraft"].map((name) => (
                <StaggerItem key={name}>
                  <div className="flex items-center gap-2 opacity-40 hover:opacity-60 transition-opacity">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {name[0]}
                    </div>
                    <span className="font-display font-semibold text-sm text-muted-foreground">{name}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <AnimatedSection className="mx-auto max-w-2xl text-center mb-14">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary">Features</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
                <LetterAnimator text="12 AI Modules." effect="bounce" tag="span" stagger={0.04} className="inline-block" />{" "}
                <LetterAnimator text="One Platform." effect="bounce" tag="span" stagger={0.04} className="inline-block text-primary" />
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Each module works autonomously and collaboratively — giving you an entire marketing department powered by artificial intelligence.
              </p>
            </AnimatedSection>

            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.05}>
              {modules.map((mod) => (
                <StaggerItem key={mod.title}>
                  <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1.5 transition-colors duration-200 group-hover:text-primary">{mod.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6">
            <AnimatedSection className="mx-auto max-w-2xl text-center mb-16">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
                <LetterAnimator text="Five steps to" effect="wave" tag="span" stagger={0.03} className="inline-block" />{" "}
                <LetterAnimator text="marketing mastery" effect="wave" tag="span" stagger={0.03} className="inline-block text-primary" />
              </h2>
              <p className="mt-4 text-base text-muted-foreground">From sign-up to full marketing automation in under 5 minutes.</p>
            </AnimatedSection>

            <div className="relative mx-auto max-w-3xl">
              <div className="absolute left-7 top-0 bottom-0 w-px bg-border hidden md:block" />
              <div className="space-y-12 md:space-y-14">
                {steps.map((step, i) => (
                  <AnimatedSection key={step.title} delay={i * 0.08}>
                    <div className="flex gap-6 items-start">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border text-[10px] font-bold text-primary">{i + 1}</div>
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 md:py-28 border-y border-border">
          <div className="max-w-5xl mx-auto px-6">
            <StaggerContainer className="grid gap-10 md:grid-cols-4 text-center">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="space-y-2">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <AnimatedSection className="mx-auto max-w-2xl text-center mb-14">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary">Testimonials</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
                <LetterAnimator text="Loved by" effect="rotate" tag="span" stagger={0.04} className="inline-block" />{" "}
                <LetterAnimator text="marketers" effect="rotate" tag="span" stagger={0.05} className="inline-block text-primary" />
              </h2>
            </AnimatedSection>

            <StaggerContainer className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t.name}>
                  <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400 transition-transform duration-200 hover:scale-110" />
                      ))}
                    </div>
                    <p className="mb-5 text-sm text-muted-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary transition-colors duration-200 group-hover:bg-primary/15">{t.name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <AnimatedSection className="mx-auto max-w-2xl text-center mb-14">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary">Pricing</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
                <LetterAnimator text="Simple, transparent" effect="flip" tag="span" stagger={0.03} className="inline-block" />{" "}
                <LetterAnimator text="pricing" effect="flip" tag="span" stagger={0.05} className="inline-block text-primary" />
              </h2>
              <p className="mt-4 text-base text-muted-foreground">Start free, scale as you grow. No hidden fees. Cancel anytime.</p>
            </AnimatedSection>

            <StaggerContainer className="grid gap-5 md:grid-cols-4 max-w-6xl mx-auto" staggerDelay={0.08}>
              {pricingPlans.map((plan) => (
                <StaggerItem key={plan.name}>
                  <div className={`relative h-full flex flex-col rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    plan.popular ? "border-primary bg-card shadow-md ring-1 ring-primary/20 hover:shadow-primary/10"
                      : "border-border bg-card hover:border-primary/20 hover:shadow-md"
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                        Most Popular
                      </div>
                    )}
                    {plan.freeTrial && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                        Free Trial
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-foreground mb-1">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                    </div>
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-display font-bold text-foreground ${plan.freeTrial ? "text-2xl" : "text-3xl"}`}>{plan.price}</span>
                        {plan.period && <span className="text-sm text-muted-foreground">/{plan.period}</span>}
                      </div>
                      {plan.savings && <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">{plan.savings}</p>}
                    </div>
                    <ul className="mb-6 flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${
                      plan.popular || plan.freeTrial
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-background text-foreground hover:bg-muted hover:border-primary/20"
                    }`}>
                      {plan.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <AnimatedSection className="mt-10 text-center" delay={0.3}>
              <p className="text-sm text-muted-foreground">
                All plans include SSL, 99.9% uptime SLA, and 24/7 support.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 border-t border-border">
          <div className="max-w-2xl mx-auto px-6">
            <AnimatedSection className="text-center mb-12">
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-muted-foreground">FAQ</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
                <LetterAnimator text="Frequently asked questions" effect="blur" tag="span" stagger={0.025} className="inline-block" />
              </h2>
            </AnimatedSection>

            <AnimatedSection>
              <div>
                {faqs.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6">
            <AnimatedSection>
              <div className="rounded-xl border border-border bg-card p-10 md:p-14 text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground mb-4">
                  <LetterAnimator text="Ready to Transform" effect="pop" tag="span" stagger={0.03} className="inline-block" />
                  <br />
                  <LetterAnimator text="Your Marketing?" effect="swing" tag="span" stagger={0.04} className="inline-block" />
                </h2>
                <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
                  Join thousands of businesses using AI to automate their marketing. Start in under 3 minutes — no credit card needed.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/register"
                    className="group inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-150 hover:bg-primary/90 active:scale-[0.98]"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
                  >
                    Schedule a Demo
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <Image src="/logo-white.svg" alt="MarketPilot AI" width={28} height={28} className="rounded-md" />
                <span className="font-display text-base font-semibold text-foreground">MarketPilot AI</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">© 2026 MarketPilot AI. All rights reserved.</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Built for HackIndia 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className={cn(
        "mx-4 mt-3 rounded-lg border bg-background/90 backdrop-blur-md transition-all duration-200 md:mx-8",
        scrolled ? "border-border shadow-sm" : "border-transparent"
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-2.5">
          <Link href="/" className="flex items-center gap-2 shrink-0" prefetch={true}>
            <Image src="/logo-white.svg" alt="MarketPilot AI" width={28} height={28} className="rounded-md" />
            <span className="font-display text-sm font-semibold text-foreground">MarketPilot AI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {["Features", "How It Works", "Pricing"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, "-"))}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:block px-3 py-1.5 transition-colors"
              prefetch={true}
            >
              Sign in
            </Link>
            <Link href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
              prefetch={true}
            >
              Get Started
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md hover:bg-muted transition-colors" aria-label="Toggle menu">
              <div className="space-y-1">
                <div className={cn("w-4 h-0.5 bg-foreground transition-all", mobileOpen && "rotate-45 translate-y-[3px]")} />
                <div className={cn("w-4 h-0.5 bg-foreground transition-all", mobileOpen && "opacity-0")} />
                <div className={cn("w-4 h-0.5 bg-foreground transition-all", mobileOpen && "-rotate-45 -translate-y-[3px]")} />
              </div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="px-5 py-4 space-y-2">
                {["Features", "How It Works", "Pricing"].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, "-"))}
                    className="block text-sm text-muted-foreground hover:text-foreground py-2 w-full text-left"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-2 border-t border-border space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2" prefetch={true}>Sign in</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="block text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    prefetch={true}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

const modules = [
  { icon: Brain, title: "Business Analyzer", description: "AI-powered SWOT analysis, market positioning, growth recommendations, and tailored marketing strategies generated in seconds." },
  { icon: Users, title: "Persona Generator", description: "Auto-generate detailed buyer personas with demographics, pain points, preferred channels, and messaging triggers." },
  { icon: PenTool, title: "Content Engine", description: "Generate blogs, social posts, email sequences, ad copy, landing pages, and 15+ content types — all tone-matched to your brand." },
  { icon: BarChart3, title: "Campaign Builder", description: "End-to-end campaign strategies with timelines, KPIs, budget allocation, content calendars, and multi-channel rollout plans." },
  { icon: Workflow, title: "Marketing Automation", description: "Visual drag-and-drop workflow builder for email sequences, lead nurturing, and cross-channel orchestration." },
  { icon: Megaphone, title: "Ad Optimization", description: "Google, Meta, and LinkedIn ad creatives with CTR/CPC prediction, A/B test recommendations, and budget optimization." },
  { icon: Search, title: "SEO Engine", description: "Live website crawling, keyword research, meta tag optimization, heading structure analysis, and competitor SEO benchmarking." },
  { icon: Building2, title: "Competitor Intelligence", description: "Track competitors weekly with SWOT comparison, strategy gap analysis, content benchmarking, and real-time alerts." },
  { icon: LineChart, title: "Analytics Dashboard", description: "ROI predictions, traffic growth graphs, conversion funnels, channel performance breakdowns, and actionable AI insights." },
  { icon: Target, title: "Personalization Engine", description: "Dynamic content personalization, segment-specific messaging, product recommendations, and audience-tailored campaigns." },
  { icon: MessageSquare, title: "AI Marketing Chat", description: "Real-time streaming chat with full business context — ask anything about your marketing strategy and get data-backed answers." },
  { icon: Layout, title: "Content Calendar", description: "Visual monthly calendar with scheduled posts, platform-specific color coding, and publish-ready queues." },
];

const steps = [
  { icon: Globe, title: "Tell us about your business", description: "Answer a few quick questions about your industry, products, and target audience. The onboarding wizard takes under 60 seconds." },
  { icon: Sparkles, title: "AI builds your marketing stack", description: "AI agents analyze your input and generate personas, content strategies, campaign plans, SEO audits, ad creatives, and automation workflows." },
  { icon: Layout, title: "Review and customize", description: "Browse your AI-generated content calendar, tweak ad copy, adjust campaign budgets, and fine-tune automation workflows." },
  { icon: Rocket, title: "Launch across all channels", description: "Publish content directly to social media, send email campaigns, activate ad spend, and schedule automation workflows — all from one dashboard." },
  { icon: LineChart, title: "Monitor and optimize", description: "Track performance with live analytics, ROI predictions, and conversion funnels. AI continuously adjusts for maximum impact." },
];

const stats = [
  { value: 12000, suffix: "+", label: "Businesses Onboarded" },
  { value: 350, suffix: "K+", label: "Content Pieces Created" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 4, suffix: "x", label: "Average ROI Increase" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Head of Marketing, TechFlow", quote: "MarketPilot replaced our entire marketing team's grunt work. What used to take a week now takes 10 minutes. The AI content engine is frighteningly good." },
  { name: "Rajesh Kumar", role: "Founder, GrowthScale", quote: "As a solo founder, I couldn't afford a marketing team. MarketPilot gave me the equivalent of a 5-person department for a fraction of the cost." },
  { name: "Emily Rodriguez", role: "CMO, BrandForward", quote: "The competitor intelligence module alone is worth it. We discovered three major gaps in our strategy that AI identified in seconds." },
];

const pricingPlans = [
  { name: "Free Trial", description: "All features. No cost. 15 full days.", price: "₹0", period: "15 days", savings: "Full unrestricted access", popular: false, freeTrial: true, features: ["1 business profile", "Unlimited AI content generation", "SEO audit & live crawl", "Workflow automation builder", "AI marketing chat assistant", "Competitor tracking", "All integrations included"], cta: "Start Free Trial" },
  { name: "Basic", description: "Perfect for freelancers and sole proprietors.", price: "₹499", period: "month", savings: "Billed monthly", popular: false, freeTrial: false, features: ["1 business profile", "AI content (30 posts/mo)", "Basic SEO audit & suggestions", "Email marketing (500 sends/mo)", "Social media scheduling", "Performance dashboard", "Email support"], cta: "Get Basic" },
  { name: "Medium", description: "For growing teams scaling their marketing.", price: "₹1,999", period: "month", savings: "Save ₹6,000/year vs monthly", popular: true, freeTrial: false, features: ["Up to 3 business profiles", "Unlimited AI content generation", "Advanced SEO with live crawl", "Ad platform integration (Google/Meta)", "Competitor intelligence", "Workflow automation builder", "AI marketing chat with context", "Team collaboration (3 members)", "Priority support"], cta: "Get Medium Plan" },
  { name: "Professional", description: "For agencies and marketing departments.", price: "₹6,999", period: "month", savings: "Dedicated account manager", popular: false, freeTrial: false, features: ["Up to 10 business profiles", "Unlimited AI content generation", "Advanced SEO + keyword research", "All ad platform integrations", "Competitor intelligence + alerts", "Custom workflow automation", "AI chat with full business context", "Team collaboration (unlimited)", "API access & webhooks", "Dedicated account manager"], cta: "Get Professional" },
];

const faqs = [
  { q: "How does MarketPilot AI work?", a: "MarketPilot uses advanced AI models to analyze your business profile and automatically generate a complete marketing strategy including content, SEO, campaigns, ads, and analytics. Simply fill out a brief questionnaire and AI handles the rest." },
  { q: "Do I need marketing experience to use it?", a: "Not at all. MarketPilot is designed for business owners and marketers of all experience levels. The AI handles the heavy lifting — you just review and approve." },
  { q: "Can I customize the AI-generated content?", a: "Yes, everything AI generates is fully editable. You can tweak copy, adjust campaigns, refine personas, and modify any output before publishing." },
  { q: "What platforms does MarketPilot integrate with?", a: "MarketPilot integrates with Google Ads, Meta Ads, LinkedIn, major email platforms, social media networks, and analytics tools. We're constantly adding new integrations." },
  { q: "Is my business data secure?", a: "Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and never share your data with third parties. Your business information is completely private." },
  { q: "What happens after the free trial?", a: "After 15 days, you can choose a paid plan that fits your needs. If you don't upgrade, your account is paused but your data is preserved for 30 days." },
];
