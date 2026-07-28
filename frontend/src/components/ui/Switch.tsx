"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function Switch({ checked, onCheckedChange, label, disabled, className, id }: SwitchProps) {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-[16px] w-[16px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-150",
            checked ? "translate-x-[20px]" : "translate-x-[3px]"
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          className="text-sm font-medium text-foreground cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}

export { Switch };
