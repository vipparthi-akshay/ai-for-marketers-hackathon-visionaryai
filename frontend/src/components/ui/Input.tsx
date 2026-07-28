"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, requiredIndicator, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground transition-colors"
        >
          {label}
          {(requiredIndicator || props.required) && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 focus:shadow-sm focus:shadow-primary/5",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
              : "border-border hover:border-border/80",
            isPassword && "pr-10",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive animate-fade-in">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
