"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await api.request<{ success: boolean; message: string }>("/api/v1/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image
              src="/logo-white.svg"
              alt="MarketPilot AI"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-display text-base font-semibold text-foreground">
              MarketPilot AI
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists with that email, we&apos;ve sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
