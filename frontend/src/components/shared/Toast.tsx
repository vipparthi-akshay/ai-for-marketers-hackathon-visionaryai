"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { CheckCircle, XCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  error: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: { id: string; message: string; type: "success" | "error" | "info" };
  onRemove: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const Icon = icons[toast.type];
  const duration = 5000;

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onRemove(toast.id);
          return 0;
        }
        return prev - 100 / (duration / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, toast.id, onRemove, duration]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-lg border overflow-hidden",
        "animate-slide-in-right shadow-lg",
        colors[toast.type]
      )}
    >
      {/* Progress bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 transition-all duration-75",
          toast.type === "success" && "bg-emerald-400",
          toast.type === "error" && "bg-red-400",
          toast.type === "info" && "bg-blue-400"
        )}
        style={{ width: `${progress}%` }}
      />

      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
