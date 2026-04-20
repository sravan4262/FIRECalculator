"use client";
import { useFireStore } from "@/lib/store";
import { useValidationErrors } from "@/lib/ValidationContext";
import { NumberField } from "@/components/ui/NumberField";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { Zap } from "lucide-react";

export function StepScenarios() {
  const { inputs, updateInputs } = useFireStore();
  const errors = useValidationErrors();

  const fireNumber = inputs.withdrawalRate > 0 ? inputs.retirementSpending / inputs.withdrawalRate : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Scenarios & assumptions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fine-tune your FIRE number and stress-test your plan.
        </p>
      </div>

      {/* FIRE number preview */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center glow-indigo">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Your FIRE number
        </p>
        <p className="text-4xl font-bold text-primary tabular-nums">
          {fireNumber > 0 ? formatCurrency(fireNumber) : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {inputs.retirementSpending > 0 && inputs.withdrawalRate > 0
            ? `${formatCurrency(inputs.retirementSpending)} ÷ ${(inputs.withdrawalRate * 100).toFixed(1)}% withdrawal rate`
            : "Enter retirement spending and withdrawal rate above"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground uppercase tracking-wide">Withdrawal rate</span>
            <span className="font-medium text-primary">{(inputs.withdrawalRate * 100).toFixed(1)}%</span>
          </div>
          <Slider
            value={[inputs.withdrawalRate * 100]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? (val as number[])[0] : (val as number);
              updateInputs({ withdrawalRate: v / 100 });
            }}
            min={2} max={6} step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2% (very conservative)</span>
            <span>6% (aggressive)</span>
          </div>
        </div>

        <NumberField
          label="Annual retirement spending"
          value={inputs.retirementSpending}
          onChange={(v) => updateInputs({ retirementSpending: v })}
          prefix="$"
          format="currency"
          placeholder="e.g. 60,000"
          hint="Your target annual spend in retirement (today's dollars)"
          error={errors.retirementSpending}
        />
      </div>

      {/* FIRE variants quick preview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lean", multiplier: 0.7, color: "text-success" },
          { label: "Standard", multiplier: 1, color: "text-primary" },
          { label: "Fat", multiplier: 1.5, color: "text-gold" },
        ].map(({ label, multiplier, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-muted/30 p-3 text-center"
          >
            <p className="text-xs text-muted-foreground">{label} FIRE</p>
            <p className={`text-sm font-bold mt-1 ${color}`}>
              {formatCurrency(fireNumber * multiplier, true)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            The 4% rule (25x rule) is a widely-cited safe withdrawal guideline from the Trinity Study.
            A more conservative 3.5% gives you a larger buffer; 5% works if you have flexible spending or other income.
          </p>
        </div>
      </div>
    </div>
  );
}
