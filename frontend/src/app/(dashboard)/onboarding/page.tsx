"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { LoadingProgress } from "@/components/shared/LoadingProgress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

const industries = [
  "Technology", "E-commerce", "Healthcare", "Finance", "Education",
  "Real Estate", "Food & Beverage", "Fashion", "Travel", "Marketing Agency",
  "Consulting", "Fitness", "Legal", "Automotive", "Other",
];

const goalOptions = [
  "Brand Awareness", "Lead Generation", "Sales Growth",
  "Customer Retention", "Website Traffic", "Social Media Growth",
  "Email Marketing", "Content Marketing",
];

const budgets = [
  "₹500 - ₹1,000/mo", "₹1,000 - ₹3,000/mo", "₹3,000 - ₹5,000/mo",
  "₹5,000 - ₹10,000/mo", "₹10,000+/mo",
];

const voiceOptions = [
  { value: "professional", label: "Professional", desc: "Clean, authoritative, trustworthy" },
  { value: "casual", label: "Casual", desc: "Relaxed, conversational, approachable" },
  { value: "friendly", label: "Friendly", desc: "Warm, encouraging, personable" },
  { value: "bold", label: "Bold", desc: "Confident, assertive, energetic" },
  { value: "luxury", label: "Luxury", desc: "Elegant, sophisticated, refined" },
  { value: "witty", label: "Witty", desc: "Clever, humorous, memorable" },
];

const totalSteps = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { organizationId, setOrganizationId } = useAuthStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    website_url: "",
    target_audience: "",
    marketing_goals: [] as string[],
    budget_range: "",
    brand_voice: "professional",
  });

  const updateForm = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleGoal = (goal: string) => {
    setForm((prev) => ({
      ...prev,
      marketing_goals: prev.marketing_goals.includes(goal)
        ? prev.marketing_goals.filter((g) => g !== goal)
        : [...prev.marketing_goals, goal],
    }));
  };

  const addProduct = useCallback(() => {
    if (productInput.trim() && !products.includes(productInput.trim())) {
      setProducts((prev) => [...prev, productInput.trim()]);
      setProductInput("");
    }
  }, [productInput, products]);

  const removeProduct = (p: string) => {
    setProducts((prev) => prev.filter((item) => item !== p));
  };

  const ensureOrg = async (): Promise<string | null> => {
    if (organizationId) return organizationId;
    try {
      const org = await import("@/lib/api").then((m) =>
        m.api.organizations.create({ name: `${form.name} Organization` })
      );
      setOrganizationId(org.id);
      return org.id;
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { api } = await import("@/lib/api");
      const orgId = await ensureOrg();
      if (!orgId) { setLoading(false); return; }
      await api.businesses.create(orgId, {
        name: form.name,
        industry: form.industry,
        description: form.description,
        website_url: form.website_url,
        products: products,
        target_audience: form.target_audience,
        marketing_goals: form.marketing_goals,
        budget_range: form.budget_range,
        brand_voice: form.brand_voice,
      });
      addToast("Business profile created! AI is analyzing your business...", "success");
      setShowCelebration(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.message || "Error creating business. Please try again.");
      setLoading(false);
    }
  };

  if (showCelebration) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
          <CelebrationEffect />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative z-10"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">You&apos;re all set!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Your business profile has been created. AI is now analyzing your industry and building your marketing strategy.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Redirecting to your dashboard...
            </div>
          </motion.div>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto py-12">
          <LoadingProgress
            steps={[
              "Creating your business profile",
              "Analyzing your industry",
              "Generating customer personas",
              "Building your marketing strategy",
              "Setting up your dashboard",
            ]}
          />
        </div>
    );
  }

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return form.name.length > 0;
    if (step === 2) return form.industry.length > 0;
    if (step === 3) return form.marketing_goals.length > 0;
    return true;
  };

  return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Set Up Your Business</h2>
          <p className="text-muted-foreground">
            Let AI build your marketing strategy in under 60 seconds.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: step === s ? 1.2 : 1,
                  backgroundColor: step > s ? "hsl(142, 71%, 45%)" : step === s ? "hsl(var(--primary))" : "hsl(var(--muted))",
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              >
                {step > s ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <span className={step === s ? "text-primary-foreground" : "text-muted-foreground"}>
                    {s + 1}
                  </span>
                )}
              </motion.div>
              {s < totalSteps - 1 && (
                <div className={cn("w-8 h-0.5 rounded-full transition-colors", step > s ? "bg-emerald-500" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">What&apos;s your primary goal?</h3>
                <p className="text-sm text-muted-foreground">Select the main reason you&apos;re using MarketPilot AI.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "grow", label: "Grow my business", icon: "📈" },
                    { id: "automate", label: "Automate marketing", icon: "⚡" },
                    { id: "content", label: "Create better content", icon: "✍️" },
                    { id: "compete", label: "Beat competitors", icon: "🏆" },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {}}
                      className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                    >
                      <span className="text-2xl block mb-2">{goal.icon}</span>
                      <span className="text-sm font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Business Basics</h3>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Business Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Acme Inc"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Industry *</label>
                  <select
                    value={form.industry}
                    onChange={(e) => updateForm("industry", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select industry</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">What does your business do?</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                    placeholder="We help small businesses grow through digital marketing..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Website URL</label>
                  <input
                    value={form.website_url}
                    onChange={(e) => updateForm("website_url", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Products &amp; Audience</h3>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Products / Services</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProduct(); } }}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                      placeholder="Type a product and press Enter"
                    />
                    <button onClick={addProduct} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {p}
                        <button onClick={() => removeProduct(p)} className="hover:text-destructive">
                          <span className="text-xs">&times;</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Who is your target audience?</label>
                  <textarea
                    value={form.target_audience}
                    onChange={(e) => updateForm("target_audience", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                    placeholder="Small business owners, 25-45 years old, tech-savvy..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Marketing Goals</h3>
                <p className="text-sm text-muted-foreground">Select all that apply.</p>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "px-4 py-2.5 rounded-full border text-sm font-medium transition-all",
                        form.marketing_goals.includes(goal)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {form.marketing_goals.includes(goal) && <Check className="inline h-3.5 w-3.5 mr-1" />}
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Budget &amp; Brand Voice</h3>
                <div>
                  <label className="text-sm font-medium block mb-3">Monthly Marketing Budget</label>
                  <div className="grid grid-cols-2 gap-2">
                    {budgets.map((b) => (
                      <button
                        key={b}
                        onClick={() => updateForm("budget_range", b)}
                        className={cn(
                          "p-3 rounded-lg border text-sm text-left transition-all",
                          form.budget_range === b
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-3">Brand Voice</label>
                  <div className="grid grid-cols-2 gap-2">
                    {voiceOptions.map((voice) => (
                      <button
                        key={voice.value}
                        onClick={() => updateForm("brand_voice", voice.value)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          form.brand_voice === voice.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        )}
                      >
                        <div className="text-sm font-medium">{voice.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{voice.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < totalSteps - 1) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={!canProceed()}
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {step < totalSteps - 1 ? (
              <>Continue <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Launch MarketPilot AI <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          {step < totalSteps - 1 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
  );
}

function CelebrationEffect() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#059669", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"][i % 6],
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: 2 + Math.random() * 2, delay: p.delay, ease: "easeOut" }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
