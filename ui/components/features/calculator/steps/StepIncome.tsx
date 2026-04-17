"use client";
import { useFireStore, currentMonthStr } from "@/lib/store";
import { NumberField } from "@/components/ui/NumberField";
import { useState } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Plus, Trash2,
  ChevronDown, ChevronRight, PiggyBank,
} from "lucide-react";
import { formatPct } from "@/lib/utils";
import type { SavingsStream } from "@/lib/engine/types";

function Section({
  title, icon, children, defaultOpen = false,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="text-primary">{icon}</span>
          {title}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

export function StepIncome() {
  const { inputs, updateInputs } = useFireStore();

  const savingsRate =
    inputs.afterTaxIncome > 0
      ? (inputs.afterTaxIncome - inputs.currentSpending) / inputs.afterTaxIncome
      : 0;
  const annualSavings = inputs.afterTaxIncome - inputs.currentSpending;

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - Math.max(0, Math.min(1, savingsRate)));

  const addStream = () => {
    updateInputs({
      savingsStreams: [
        ...(inputs.savingsStreams ?? []),
        {
          label: `Stream ${(inputs.savingsStreams?.length ?? 0) + 1}`,
          monthlyAmount: 500,
          annualIncreaseRate: 0.03,
          startDate: currentMonthStr(),
          endDate: "",
        } satisfies SavingsStream,
      ],
    });
  };

  const removeStream = (idx: number) => {
    updateInputs({ savingsStreams: (inputs.savingsStreams ?? []).filter((_, i) => i !== idx) });
  };

  const updateStream = (idx: number, patch: Partial<SavingsStream>) => {
    updateInputs({
      savingsStreams: (inputs.savingsStreams ?? []).map((s, i) =>
        i === idx ? { ...s, ...patch } : s
      ),
    });
  };

  const totalStreams = (inputs.savingsStreams ?? []).reduce(
    (s, st) => s + st.monthlyAmount,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Income & spending</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your savings rate is the single biggest lever for early retirement.
        </p>
      </div>

      <div className="grid gap-4">
        <NumberField
          label="Annual gross income"
          icon={<DollarSign className="w-4 h-4" />}
          value={inputs.grossIncome}
          onChange={(v) => updateInputs({ grossIncome: v })}
          prefix="$"
          format="currency"
          hint="Before taxes and deductions"
        />
        <NumberField
          label="Annual after-tax income"
          icon={<DollarSign className="w-4 h-4" />}
          value={inputs.afterTaxIncome}
          onChange={(v) => updateInputs({ afterTaxIncome: v })}
          prefix="$"
          format="currency"
          hint="Take-home pay you actually receive"
        />
        <NumberField
          label="Annual spending"
          icon={<ShoppingCart className="w-4 h-4" />}
          value={inputs.currentSpending}
          onChange={(v) => updateInputs({ currentSpending: v })}
          prefix="$"
          format="currency"
          hint="What you actually spend each year"
        />
        <NumberField
          label="Salary growth rate"
          icon={<TrendingUp className="w-4 h-4" />}
          value={inputs.salaryGrowthRate}
          onChange={(v) => updateInputs({ salaryGrowthRate: v })}
          format="percent"
          suffix="%/yr"
          min={0}
          max={0.3}
          hint="Expected annual raise (e.g. 3%)"
        />
      </div>

      {/* Savings rate visual */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="20" fill="none" stroke="currentColor" strokeWidth="4"
              className="text-border" />
            <circle cx="26" cy="26" r="20" fill="none" stroke="currentColor" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={savingsRate >= 0.5 ? "text-success" : savingsRate >= 0.25 ? "text-primary" : "text-warning"}
              transform="rotate(-90 26 26)"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {formatPct(savingsRate, 0)}
          </span>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Base savings rate</p>
          <p className="text-muted-foreground text-xs">
            You save{" "}
            <span className="text-foreground font-medium">
              ${Math.max(0, annualSavings).toLocaleString()}
            </span>{" "}
            per year
            {totalStreams > 0 && (
              <> +{" "}
                <span className="text-primary font-medium">
                  ${(totalStreams * 12).toLocaleString()}
                </span>{" "}
                from streams
              </>
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {savingsRate >= 0.5
              ? "Excellent — FIRE is very achievable"
              : savingsRate >= 0.3
              ? "Good — you're on a solid path"
              : savingsRate >= 0.15
              ? "Moderate — consider cutting spending"
              : "Low — aggressive action needed"}
          </p>
        </div>
      </div>

      {/* Additional savings streams */}
      <Section title="Additional savings streams" icon={<PiggyBank className="w-4 h-4" />}>
        <p className="text-xs text-muted-foreground">
          Named savings vehicles (SIP, 401k, LIC, chits, etc.) added on top of your
          base income − spending. Each stream can have its own growth rate and date range.
        </p>
        <div className="space-y-4">
          {(inputs.savingsStreams ?? []).map((stream, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent text-sm font-medium border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={stream.label}
                  onChange={(e) => updateStream(idx, { label: e.target.value })}
                  placeholder="Stream label (e.g. SIP, 401k)"
                />
                <button
                  onClick={() => removeStream(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Monthly amount"
                  value={stream.monthlyAmount}
                  onChange={(v) => updateStream(idx, { monthlyAmount: v })}
                  prefix="$"
                  format="currency"
                />
                <NumberField
                  label="Annual increase"
                  value={stream.annualIncreaseRate}
                  onChange={(v) => updateStream(idx, { annualIncreaseRate: v })}
                  format="percent"
                  suffix="%/yr"
                  min={0}
                  max={0.3}
                  hint="How fast this stream grows"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Start date</label>
                  <input
                    type="month"
                    value={stream.startDate}
                    onChange={(e) => updateStream(idx, { startDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">End date (optional)</label>
                  <input
                    type="month"
                    value={stream.endDate}
                    onChange={(e) => updateStream(idx, { endDate: e.target.value })}
                    placeholder="No end"
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addStream}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add savings stream
          </button>
        </div>
      </Section>
    </div>
  );
}
