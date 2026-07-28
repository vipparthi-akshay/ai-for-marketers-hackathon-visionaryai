"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const industries = [
  "Technology", "E-commerce", "Healthcare", "Finance", "Education",
  "Real Estate", "Food & Beverage", "Fashion", "Travel", "Marketing Agency",
  "Consulting", "Fitness", "Legal", "Automotive", "Other",
];

const goals = [
  "Brand Awareness", "Lead Generation", "Sales Growth",
  "Customer Retention", "Website Traffic", "Social Media Growth",
];

const budgets = [
  "₹500 - ₹1,000/mo", "₹1,000 - ₹3,000/mo", "₹3,000 - ₹5,000/mo",
  "₹5,000 - ₹10,000/mo", "₹10,000+/mo",
];

export default function NewBusinessPage() {
  const router = useRouter();
  const { organizationId, setOrganizationId } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
    website_url: "",
    products: "",
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

  const ensureOrg = async (): Promise<string | null> => {
    if (organizationId) return organizationId;
    try {
      const org = await api.organizations.create({
        name: `${form.name} Organization`,
      });
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
      const orgId = await ensureOrg();
      if (!orgId) {
        setLoading(false);
        return;
      }
      await api.businesses.create(orgId, {
        name: form.name,
        industry: form.industry,
        description: form.description,
        website_url: form.website_url,
        products: form.products
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        target_audience: form.target_audience,
        marketing_goals: form.marketing_goals,
        budget_range: form.budget_range,
        brand_voice: form.brand_voice,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error creating business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Business</h2>
        <p className="text-muted-foreground mb-8">
          Tell us about your business and AI will build your marketing strategy.
        </p>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all ${
                  step >= s ? "bg-primary w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Business Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Acme Inc"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Industry *
              </label>
              <select
                value={form.industry}
                onChange={(e) => updateForm("industry", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select industry</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                placeholder="What does your business do?"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Website URL
              </label>
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
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Products/Services (comma-separated)
              </label>
              <input
                value={form.products}
                onChange={(e) => updateForm("products", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Product A, Service B, Course C"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Target Audience
              </label>
              <textarea
                value={form.target_audience}
                onChange={(e) =>
                  updateForm("target_audience", e.target.value)
                }
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
                placeholder="Small business owners, 25-45 years old, tech-savvy"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-3">
                Marketing Goals
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      form.marketing_goals.includes(goal)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="text-sm font-medium block mb-3">
                Monthly Marketing Budget
              </label>
              <div className="space-y-2">
                {budgets.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateForm("budget_range", b)}
                    className={`w-full p-3 rounded-lg border text-sm text-left transition-all ${
                      form.budget_range === b
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Brand Voice
              </label>
              <select
                value={form.brand_voice}
                onChange={(e) => updateForm("brand_voice", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="bold">Bold</option>
                <option value="luxury">Luxury</option>
                <option value="witty">Witty</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !form.name}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? "AI is analyzing your business..."
                : "Launch MarketPilot AI"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
