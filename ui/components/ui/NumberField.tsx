"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  icon?: React.ReactNode;
  format?: "number" | "currency" | "percent";
  className?: string;
}

function displayValue(value: number, format: string, prefix?: string): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US").format(value);
  }
  if (format === "percent") {
    return (value * 100).toFixed(1);
  }
  return String(value);
}

function parseValue(raw: string, format: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (format === "percent") return num / 100;
  return num;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
  icon,
  format = "number",
  className,
}: NumberFieldProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");

  const displayed = focused ? raw : displayValue(value, format, prefix);

  const handleFocus = () => {
    setFocused(true);
    setRaw(displayValue(value, format, prefix));
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseValue(raw, format);
    const clamped =
      min !== undefined && max !== undefined
        ? Math.min(Math.max(parsed, min), max)
        : parsed;
    onChange(clamped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  return (
    <div className={cn("group", className)}>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-input px-3 py-2.5 transition-all duration-200",
          focused
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-border/80"
        )}
      >
        {icon && (
          <span className={cn("shrink-0 transition-colors", focused ? "text-primary" : "text-muted-foreground")}>
            {icon}
          </span>
        )}
        {prefix && (
          <span className="text-muted-foreground text-sm shrink-0">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={displayed}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
        />
        {suffix && (
          <span className="text-muted-foreground text-xs shrink-0">{suffix}</span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>
      )}
    </div>
  );
}
