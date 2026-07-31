"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, Users, Trophy, Clock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { saveRegistration, findAccount, setSession } from "@/lib/auth";

type FormState = {
  teamName: string;
  name: string;
  email: string;
  teamSize: string;
  track: string;
  linkedin: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const FAKE_PATTERNS = [
  /^test/i,
  /^fake/i,
  /^dummy/i,
  /^example/i,
  /^asdf/,
  /^qwerty/,
  /^xyz/i,
  /^abc/i,
  /^foo/i,
  /^bar/i,
  /^johndoe/i,
  /^john doe/i,
  /^n\/a$/i,
  /^none$/i,
  /^null$/i,
  /^user/i,
  /^admin/i,
  /(.)\1{2,}/,
  /^\d+$/,
];

const THROWAWAY_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "sharklasers.com", "yopmail.com",
  "temp-mail.org", "10minutemail.com", "maildrop.cc", "getnada.com",
  "throwawaymail.com", "dispostable.com", "mailnesia.com", "inboxbear.com",
];

function hasFakePattern(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return FAKE_PATTERNS.some((re) => re.test(lower));
}

function isLikelyFakeName(value: string): boolean {
  const name = value.trim();
  if (name.length < 2 || name.length > 60) return true;
  if (hasFakePattern(name)) return true;
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2) return true;
  if (words.some((w) => w.length < 2)) return true;
  if (!/^[a-zA-Z\u00C0-\u024F' .-]+$/.test(name)) return true;
  const [first, last] = words;
  return first.toLowerCase() === last.toLowerCase();
}

function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Email address is required.";
  if (value.length > 254) return "Email address is too long.";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) return "Please enter a valid email address.";
  const [, domain] = value.split("@");
  if (THROWAWAY_DOMAINS.includes(domain.toLowerCase())) {
    return "Please use a real email address. Throwaway mail services are not allowed.";
  }
  if (hasFakePattern(value)) return "This looks like a fake email address. Please use your real one.";
  return undefined;
}

function validateForm(form: FormState): Errors {
  const errors: Errors = {};

  const teamName = form.teamName.trim();
  if (!teamName) errors.teamName = "Team name is required.";
  else if (teamName.length < 2) errors.teamName = "Team name must be at least 2 characters.";
  else if (hasFakePattern(teamName)) errors.teamName = "Please enter a real team name.";
  else if (teamName.length > 80) errors.teamName = "Team name must be under 80 characters.";

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  if (form.linkedin.trim()) {
    const url = form.linkedin.trim();
    let valid = false;
    try {
      const parsed = new URL(url);
      valid = parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      valid = false;
    }
    if (!valid) errors.linkedin = "Please enter a valid URL (e.g. https://linkedin.com/in/you).";
  }

  const password = form.password;
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (!/[a-zA-Z]/.test(password)) errors.password = "Password must contain at least one letter.";
  else if (!/\d/.test(password)) errors.password = "Password must contain at least one number.";
  else if (hasFakePattern(password)) errors.password = "Choose a stronger, real password.";

  if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (form.confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";

  return errors;
}

function validateName(name: string): string | undefined {
  const value = name.trim();
  if (!value) return "Full name is required.";
  if (isLikelyFakeName(value)) return "Please enter your real full name (first and last name).";
  return undefined;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1 text-xs text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
      {message}
    </p>
  );
}

export default function Register() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<FormState>({
    teamName: "",
    name: "",
    email: "",
    teamSize: "2-3",
    track: "AI Content Engine",
    linkedin: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    if (errors[key]) {
      const nextErrors = { ...errors };
      delete nextErrors[key];
      setErrors(nextErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      if (findAccount(form.email)) {
        setErrors({ email: "An account with this email already exists. Please sign in instead." });
        return;
      }
      saveRegistration({
        teamName: form.teamName.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        teamSize: form.teamSize,
        track: form.track,
        linkedin: form.linkedin.trim(),
        password: form.password,
        createdAt: new Date().toISOString(),
      });
      setSession(form.email);
      setSubmitted(true);
    }
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
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-32 pb-24 md:pt-40">
          <div className="max-w-xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Register Now
              </span>
              <h1 className="font-display text-3xl font-bold mt-4 md:text-4xl">
                Register Your Team
              </h1>
              <p className="mt-4 text-muted-foreground">
                Join the hackathon and build the future of marketing using AI. Slots are limited. Please register with your real information.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-10 grid grid-cols-3 gap-3 text-center"
            >
              {[
                { icon: Trophy, label: "50,000 Tokens" },
                { icon: Users, label: "Teams of 2-5" },
                { icon: Clock, label: "48-72 Hours" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-3">
                  <item.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-7 w-7" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">You're In!</h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                    Thanks, {form.name}! Your registration for <strong className="text-foreground">{form.teamName}</strong> has been received. We'll email confirmation to <strong className="text-foreground">{form.email}</strong>.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                  >
                    Back to Home <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Team Name *</label>
                    <input
                      value={form.teamName}
                      onChange={update("teamName")}
                      placeholder="e.g. The AI Marketers"
                      className={inputClass}
                    />
                    <FieldError message={errors.teamName} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                    <FieldError message={errors.name} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@company.com"
                      className={inputClass}
                    />
                    <FieldError message={errors.email} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={update("password")}
                        placeholder="At least 8 characters with letters and numbers"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError message={errors.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={update("confirmPassword")}
                        placeholder="Re-enter your password"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldError message={errors.confirmPassword} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Team Size</label>
                      <select
                        value={form.teamSize}
                        onChange={update("teamSize")}
                        className={inputClass}
                      >
                        <option>2-3</option>
                        <option>4-5</option>
                        <option>Solo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Preferred Track</label>
                      <select
                        value={form.track}
                        onChange={update("track")}
                        className={inputClass}
                      >
                        <option>AI Content Engine</option>
                        <option>AI Ads Optimization</option>
                        <option>Marketing Automation</option>
                        <option>Customer Insights & Analytics</option>
                        <option>Personalization Engines</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">LinkedIn / Portfolio (optional)</label>
                    <input
                      value={form.linkedin}
                      onChange={update("linkedin")}
                      placeholder="https://linkedin.com/in/you"
                      className={inputClass}
                    />
                    <FieldError message={errors.linkedin} />
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-400">
                      Please fix the highlighted fields above. We only accept genuine registrations.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
                  >
                    Submit Registration
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    By registering you agree to the hackathon rules and code of conduct. Registrations with fake information will be rejected.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
