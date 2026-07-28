"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Mail, Lock, Users, Zap, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthBackground } from "@/components/backgrounds/AuthBackground";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setOrganizationId, isAuthenticated, initialize } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const fetchOrgAndRedirect = useCallback(async () => {
    try {
      const me = await api.auth.me();
      setUser(me);
      const storedOrgId = useAuthStore.getState().organizationId;
      if (storedOrgId) {
        router.push("/dashboard");
        return;
      }
      router.push("/business/new");
    } catch {
      router.push("/business/new");
    }
  }, [setUser, router]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrgAndRedirect();
    }
  }, [isAuthenticated, fetchOrgAndRedirect]);

  const validate = (): boolean => {
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.auth.login({
        email: formData.email,
        password: formData.password,
      });
      setUser(res.user as any);

      try {
        const orgs = await api.request<any[]>("/api/v1/businesses", {
          method: "GET",
        });
        if (orgs && orgs.length > 0) {
          setOrganizationId(orgs[0].id);
          router.push("/dashboard");
        } else {
          router.push("/business/new");
        }
      } catch {
        router.push("/business/new");
      }
    } catch (err: any) {
      setApiError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setApiError("");

    if (provider === "github" || provider === "microsoft") {
      window.location.href = `/api/v1/auth/${provider}`;
    }
  };

  const updateField = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const socialProviders = [
    { id: "github", label: "GitHub", bg: "bg-gray-800 dark:bg-gray-700", border: "border-gray-600", text: "text-white", icon: "GH", hover: "hover:bg-gray-700 dark:hover:bg-gray-600" },
    { id: "microsoft", label: "Microsoft", bg: "bg-white dark:bg-white/10", border: "border-gray-300 dark:border-gray-600", text: "text-gray-800 dark:text-white", icon: "M", hover: "hover:bg-gray-50 dark:hover:bg-white/20" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Image
                src="/logo-white.svg"
                alt="MarketPilot AI"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </motion.div>
            <span className="font-display text-base font-semibold text-foreground">
              MarketPilot AI
            </span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-foreground"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Sign in to your marketing command center
          </motion.p>
        </div>

        {/* Social login buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-4"
        >
          {socialProviders.map((provider, idx) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
            >
              <button
                onClick={() => handleSocialLogin(provider.id)}
                disabled={socialLoading !== null}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
                  provider.bg, provider.border, provider.text, provider.hover,
                  socialLoading !== null && "opacity-50 cursor-not-allowed"
                )}
              >
                {socialLoading === provider.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-sm font-bold">{provider.icon}</span>
                )}
                {socialLoading === provider.id ? "Connecting..." : `Continue with ${provider.label}`}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-6 shadow-sm">
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  error={errors.email}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe || false}
                    onChange={(e) => updateField("rememberMe", e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-background accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-all duration-200"
                  size="lg"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
            </form>
          </div>

          {/* Register link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-5"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Start free trial
            </Link>
          </motion.p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5"
          >
            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-4">
              Trusted by marketing teams worldwide
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: "12,000+", sub: "Businesses" },
                { icon: Zap, label: "350K+", sub: "Content pieces" },
                { icon: Shield, label: "98%", sub: "Satisfaction" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
