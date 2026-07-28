"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bell, Check, CheckCheck, Trash2, FileText, Rocket,
  Search, Megaphone, Sparkles, TrendingUp, AlertCircle,
  MessageSquare, UserPlus,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "content" | "campaign" | "seo" | "ads" | "system" | "ai" | "team";
  read: boolean;
  time: string;
}

const mockNotifications: Notification[] = [
  { id: "1", title: "AI finished generating blog post", description: "\"10 Marketing Trends for 2026\" is ready for review.", type: "content", read: false, time: "2 min ago" },
  { id: "2", title: "Campaign milestone reached", description: "\"Summer Sale\" campaign hit 10,000 impressions.", type: "campaign", read: false, time: "15 min ago" },
  { id: "3", title: "SEO audit complete", description: "Your website score improved from 72 to 85.", type: "seo", read: false, time: "1 hour ago" },
  { id: "4", title: "New ad creative ready", description: "3 Facebook ad variations generated for review.", type: "ads", read: true, time: "3 hours ago" },
  { id: "5", title: "AI suggestion available", description: "Based on competitor analysis, consider adjusting your content schedule.", type: "ai", read: true, time: "5 hours ago" },
  { id: "6", title: "Team member joined", description: "Sarah joined your workspace as an Editor.", type: "team", read: true, time: "Yesterday" },
  { id: "7", title: "Weekly report ready", description: "Your marketing performance summary for this week is available.", type: "system", read: true, time: "2 days ago" },
];

const typeIconMap: Record<string, typeof FileText> = {
  content: FileText, campaign: Rocket, seo: Search, ads: Megaphone,
  system: AlertCircle, ai: Sparkles, team: UserPlus,
};

const typeColorMap: Record<string, string> = {
  content: "text-emerald-400 bg-emerald-500/10",
  campaign: "text-blue-400 bg-blue-500/10",
  seo: "text-green-400 bg-green-500/10",
  ads: "text-amber-400 bg-amber-500/10",
  system: "text-slate-400 bg-slate-500/10",
  ai: "text-teal-400 bg-teal-500/10",
  team: "text-cyan-400 bg-cyan-500/10",
};

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-1 p-3 border-b border-border/50">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                    filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">All caught up!</h4>
                  <p className="text-xs text-muted-foreground">No notifications to show.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filtered.map((notif) => {
                    const Icon = typeIconMap[notif.type] || Bell;
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={cn(
                          "group relative flex gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                          notif.read ? "hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/8"
                        )}
                        onClick={() => markAsRead(notif.id)}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeColorMap[notif.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{notif.title}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{notif.description}</div>
                          <div className="text-[11px] text-muted-foreground/60 mt-1">{notif.time}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                          className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
