"use client";
import { useFireStore } from "@/lib/store";
import { formatCurrency, formatPct } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

const REQUIRED_FIELDS: { key: string; label: string; format: "currency" | "percent" | "age" | "number" }[] = [
  { key: "currentAge", label: "Current age", format: "age" },
  { key: "retirementAge", label: "Retire at", format: "age" },
  { key: "afterTaxIncome", label: "After-tax income", format: "currency" },
  { key: "currentSpending", label: "Annual spending", format: "currency" },
  { key: "currentPortfolio", label: "Portfolio balance", format: "currency" },
  { key: "retirementSpending", label: "Retirement spending", format: "currency" },
  { key: "expectedReturn", label: "Expected return", format: "percent" },
];

function displayField(
  value: number | undefined,
  format: string
): string | null {
  if (value === undefined || value === 0) return null;
  if (format === "currency") return formatCurrency(value, true);
  if (format === "percent") return formatPct(value);
  if (format === "age") return `${value} years`;
  return String(value);
}

export function DataPanel() {
  const { inputs, chatCollectedFields, chatReady, calculate } = useFireStore();
  const filled = chatCollectedFields.size;
  const total = REQUIRED_FIELDS.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="glass rounded-2xl p-4 space-y-4 h-fit">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Collected data
        </p>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{filled} of {total} fields</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {REQUIRED_FIELDS.map(({ key, label, format }) => {
            const value = inputs[key as keyof typeof inputs] as number | undefined;
            const collected = chatCollectedFields.has(key);
            const display = displayField(value, format);

            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  {collected ? (
                    <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                {collected && display && (
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {display}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {chatReady && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={calculate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors glow-indigo"
        >
          <Flame className="w-4 h-4" />
          Calculate FIRE
        </motion.button>
      )}
    </div>
  );
}
