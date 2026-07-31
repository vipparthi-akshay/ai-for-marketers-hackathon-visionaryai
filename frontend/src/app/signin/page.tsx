"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findAccount, setSession } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Email address is required.";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
      nextErrors.email = "Please enter a valid email address.";

    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const account = findAccount(email);
    if (!account) {
      setFormError("No account found with this email. Please register first.");
      return;
    }
    if (account.password !== password) {
      setFormError("Incorrect password. Please try again.");
      return;
    }

    setSession(account.email);
    router.push("/");
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

        <main className="pt-32 pb-24 md:pt-40">
          <div className="max-w-md mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Welcome Back
              </span>
              <h1 className="font-display text-3xl font-bold mt-4 md:text-4xl">
                Sign In
              </h1>
              <p className="mt-4 text-muted-foreground">
                Access your hackathon dashboard and manage your team registration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="mt-1.5 flex items-start gap-1 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
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
                  {errors.password && (
                    <p className="mt-1.5 flex items-start gap-1 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {formError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-400">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register Now
                  </Link>
                </div>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
