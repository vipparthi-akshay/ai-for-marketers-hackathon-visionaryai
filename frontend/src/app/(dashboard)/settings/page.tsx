"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Bell, CreditCard, Palette, Camera, Eye, EyeOff,
  Smartphone, Mail, FileText, TrendingUp, Calendar, MessageSquare,
  Check, X, ChevronRight, Trash2, AlertTriangle, Monitor, Sun, Moon,
  Sparkles, Lock, Key, Laptop,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

const accentColors = [
  { name: "Emerald", value: "emerald", class: "bg-emerald-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Rose", value: "rose", class: "bg-rose-500" },
];

const mockSessions = [
  { id: "1", device: "MacBook Pro", browser: "Chrome 120", ip: "192.168.1.x", lastActive: "Active now", current: true },
  { id: "2", device: "iPhone 15", browser: "Safari", ip: "10.0.0.x", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Windows Desktop", browser: "Firefox 121", ip: "172.16.0.x", lastActive: "3 days ago", current: false },
];

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
  });

  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [twoFactor, setTwoFactor] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true, push: true, content: true, campaign: true, weekly: false,
  });

  const [accentColor, setAccentColor] = useState("emerald");
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarPos, setSidebarPos] = useState<"left" | "right">("left");

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-6">Profile Information</h3>
                      <div className="flex items-center gap-6 mb-6">
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                            {user?.full_name?.[0] || "U"}
                          </div>
                          <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5 text-white" />
                          </button>
                        </div>
                        <div>
                          <button className="text-sm font-medium text-primary hover:underline">Upload photo</button>
                          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Full Name</label>
                          <input
                            value={profile.full_name}
                            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Email</label>
                          <input
                            value={profile.email}
                            readOnly
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Phone <span className="text-muted-foreground">(optional)</span></label>
                          <input
                            value={profile.phone}
                            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="text-sm font-medium block mb-1.5">Bio</label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm h-24 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-6">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        {(["current", "new", "confirm"] as const).map((field) => (
                          <div key={field}>
                            <label className="text-sm font-medium block mb-1.5 capitalize">
                              {field === "confirm" ? "Confirm New Password" : field === "new" ? "New Password" : "Current Password"}
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type={showPasswords[field] ? "text" : "password"}
                                value={password[field]}
                                onChange={(e) => setPassword((p) => ({ ...p, [field]: e.target.value }))}
                                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, [field]: !p[field] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPasswords[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Two-Factor Authentication</h4>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">Coming Soon</span>
                          <button
                            disabled
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-not-allowed",
                              twoFactor ? "bg-emerald-500" : "bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                twoFactor ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        {mockSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              {session.device.includes("iPhone") ? (
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Laptop className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <div className="text-sm font-medium flex items-center gap-2">
                                  {session.device}
                                  {session.current && (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Current</span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {session.browser} · {session.ip} · {session.lastActive}
                                </div>
                              </div>
                            </div>
                            {!session.current && (
                              <button className="text-xs text-destructive hover:underline">Revoke</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
                      <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Dialog.Root open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <Dialog.Trigger asChild>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-2xl z-50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                              </div>
                              <Dialog.Title className="font-semibold">Delete Account</Dialog.Title>
                            </div>
                            <Dialog.Description className="text-sm text-muted-foreground mb-6">
                              This will permanently delete your account, all business profiles, generated content, and analytics data. This cannot be undone.
                            </Dialog.Description>
                            <div className="flex justify-end gap-3">
                              <Dialog.Close asChild>
                                <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                                  Cancel
                                </button>
                              </Dialog.Close>
                              <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                                Delete Everything
                              </button>
                            </div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="font-semibold mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { key: "email" as const, label: "Email Notifications", desc: "Receive notifications via email", icon: Mail },
                        { key: "push" as const, label: "Push Notifications", desc: "Browser push notifications", icon: Bell },
                        { key: "content" as const, label: "Content Updates", desc: "When AI generates new content", icon: FileText },
                        { key: "campaign" as const, label: "Campaign Alerts", desc: "Campaign performance and milestones", icon: TrendingUp },
                        { key: "weekly" as const, label: "Weekly Digest", desc: "Summary of your marketing metrics", icon: Calendar },
                      ].map(({ key, label, desc, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleNotification(key)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              notifications[key] ? "bg-primary" : "bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                notifications[key] ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "billing" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-6">Current Plan</h3>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                        <div>
                          <div className="text-lg font-bold">Starter Plan</div>
                          <div className="text-sm text-muted-foreground">₹999/month · Renews on Aug 15, 2026</div>
                        </div>
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          Upgrade Plan
                        </button>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">AI Generations</span>
                          <span className="text-sm font-medium">45 / 100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">55 generations remaining this month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Starter", price: "₹999", features: ["1 business", "100 AI generations", "Basic analytics", "Email support"], current: true },
                        { name: "Growth", price: "₹2,999", features: ["5 businesses", "Unlimited AI", "Advanced analytics", "Priority support"], popular: true },
                        { name: "Enterprise", price: "₹7,999", features: ["Unlimited businesses", "Custom AI models", "White-label", "Dedicated manager"] },
                      ].map((plan) => (
                        <div
                          key={plan.name}
                          className={cn(
                            "rounded-lg border p-5 transition-all",
                            plan.current
                              ? "border-primary/40 bg-primary/5"
                              : plan.popular
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-card hover:border-border"
                          )}
                        >
                          {plan.popular && (
                            <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-2">
                              POPULAR
                            </div>
                          )}
                          <div className="font-semibold mb-1">{plan.name}</div>
                          <div className="text-2xl font-bold mb-3">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                          <ul className="space-y-2 mb-4">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <button
                            className={cn(
                              "w-full py-2 rounded-lg text-sm font-medium transition-all",
                              plan.current
                                ? "bg-muted text-muted-foreground cursor-default"
                                : plan.popular
                                ? "bg-primary text-primary-foreground hover:opacity-90"
                                : "border border-border text-foreground hover:bg-muted"
                            )}
                          >
                            {plan.current ? "Current Plan" : "Upgrade"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-6">Theme</h3>
                      <div className="grid grid-cols-3 gap-3 max-w-md">
                        {[
                          { id: "light" as const, label: "Light", icon: Sun },
                          { id: "dark" as const, label: "Dark", icon: Moon },
                          { id: "system" as const, label: "System", icon: Monitor },
                        ].map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setTheme(id === "system" ? "dark" : id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                              theme === id || (id === "system" && theme === "dark")
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-6">Accent Color</h3>
                      <div className="flex gap-3">
                        {accentColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setAccentColor(color.value)}
                            className={cn(
                              "w-10 h-10 rounded-full transition-all",
                              color.class,
                              accentColor === color.value
                                ? "ring-2 ring-offset-2 ring-offset-card ring-white scale-110"
                                : "opacity-60 hover:opacity-100"
                            )}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm font-medium">Compact Mode</div>
                          <div className="text-xs text-muted-foreground">Reduce spacing and padding throughout the UI</div>
                        </div>
                        <button
                          onClick={() => setCompactMode(!compactMode)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            compactMode ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              compactMode ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="font-semibold mb-4">Sidebar Position</h3>
                      <div className="flex gap-3">
                        {(["left", "right"] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setSidebarPos(pos)}
                            className={cn(
                              "px-6 py-2.5 rounded-lg border text-sm font-medium transition-all capitalize",
                              sidebarPos === pos
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}
