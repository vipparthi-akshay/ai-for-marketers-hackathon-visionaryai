"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function Select({
  className,
  label,
  error,
  helperText,
  options,
  placeholder,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {props.required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm text-foreground",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive/50 focus:ring-destructive/20"
              : "border-border hover:border-border/80",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export { Select };
