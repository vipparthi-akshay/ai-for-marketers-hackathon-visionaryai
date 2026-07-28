import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms of service" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(200),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().max(2000).optional(),
  website_url: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  products: z.string().max(2000).optional(),
  target_audience: z.string().max(1000).optional(),
  marketing_goals: z.string().max(1000).optional(),
  budget_range: z.string().optional(),
  brand_voice: z.string().optional(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;

export const contentGenerationSchema = z.object({
  content_type: z.string().min(1, "Content type is required"),
  topic: z.string().min(1, "Topic is required").max(500),
  tone: z.string().optional(),
  platform: z.string().optional(),
  additional_instructions: z.string().max(2000).optional(),
});

export type ContentGenerationFormData = z.infer<typeof contentGenerationSchema>;

export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  objective: z.string().min(1, "Objective is required"),
  target_audience: z.string().min(1, "Target audience is required"),
  budget: z.number().min(0, "Budget must be positive").optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  channels: z.array(z.string()).min(1, "Select at least one channel"),
  description: z.string().max(2000).optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string().email("Please enter a valid email address"),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications_enabled: z.boolean(),
  email_notifications: z.boolean(),
  auto_save: z.boolean(),
  language: z.string(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const seoAnalysisSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  focus_keyword: z.string().max(200).optional(),
});

export type SeoAnalysisFormData = z.infer<typeof seoAnalysisSchema>;

export const adGenerationSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  product_name: z.string().min(1, "Product name is required").max(200),
  target_audience: z.string().min(1, "Target audience is required"),
  budget: z.number().min(0).optional(),
  tone: z.string().optional(),
  additional_details: z.string().max(2000).optional(),
});

export type AdGenerationFormData = z.infer<typeof adGenerationSchema>;

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}
