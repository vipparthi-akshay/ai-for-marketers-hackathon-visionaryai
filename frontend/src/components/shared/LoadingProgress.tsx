"use client";

import { useEffect, useState } from "react";

interface LoadingProgressProps {
  steps: string[];
  currentStep?: number;
}

export function LoadingProgress({ steps, currentStep: externalStep }: LoadingProgressProps) {
  const [internalStep, setInternalStep] = useState(0);
  const step = externalStep ?? internalStep;

  useEffect(() => {
    if (externalStep !== undefined) return;
    if (step < steps.length - 1) {
      const timer = setTimeout(() => setInternalStep((s) => s + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [step, steps.length, externalStep]);

  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <h3 className="font-semibold text-lg mb-2">AI is working on it...</h3>
      <p className="text-sm text-muted-foreground mb-6">This usually takes 15-30 seconds</p>
      <div className="max-w-sm mx-auto space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i === step && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-sm mx-auto">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
