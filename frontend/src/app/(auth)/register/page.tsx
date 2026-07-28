"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, type RegisterFormData, getPasswordStrength } from "@/lib/validations";
import { Check, X } from "lucide-react";
import { AuthBackground } from "@/components/backgrounds/AuthBackground";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setOrganizationId } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true as unknown as true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const passwordChecks = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "One digit", met: /[0-9]/.test(formData.password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];

  const validate = (): boolean => {
    const result = registerSchema.safeParse({
      ...formData,
      acceptTerms: acceptedTerms ? true : undefined,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
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
      const res = await api.auth.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });
      setUser(res.user as any);

      try {
        const org = await api.organizations.create({
          name: `${formData.full_name}'s Organization`,
        });
        setOrganizationId(org.id);
      } catch {
        // org creation can fail
      }

      router.push("/business/new");
    } catch (err: any) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start your AI marketing journey — free
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-6 shadow-sm">
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {apiError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              required
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              error={errors.full_name}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
            />

            {/* Password Strength */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                        i < strength.score
                          ? strengthColors[strength.score - 1]
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength: <span className="font-medium text-foreground">{strength.label}</span>
                </p>
                <div className="space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      {check.met ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/40" />
                      )}
                      <span
                        className={`text-xs ${
                          check.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        }`}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              required
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />

            {/* Terms */}
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border bg-background accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <span className="text-primary hover:text-primary/80">Terms of Service</span>
                  {" "}and{" "}
                  <span className="text-primary hover:text-primary/80">Privacy Policy</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive">{errors.acceptTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-all duration-200"
              size="lg"
              disabled={!acceptedTerms}
            >
              Create account
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
