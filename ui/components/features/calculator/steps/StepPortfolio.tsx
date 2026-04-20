"use client";
import { useFireStore } from "@/lib/store";
import { NumberField } from "@/components/ui/NumberField";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  Wallet, TrendingUp, Activity, Plus, Trash2,
  ChevronDown, ChevronRight,
} from "lucide-react";
import type { AssetClass, AccountType } from "@/lib/engine/types";

const ASSET_PRESETS: { label: string; annualReturn: number; accountType: AccountType }[] = [
  { label: "Stocks / Equity",     annualReturn: 0.10, accountType: "taxable" },
  { label: "Bonds / FDs / Debt",  annualReturn: 0.06, accountType: "taxable" },
  { label: "Real Estate",         annualReturn: 0.08, accountType: "taxable" },
  { label: "Gold",                annualReturn: 0.07, accountType: "taxable" },
  { label: "SIP / Mutual Funds",  annualReturn: 0.12, accountType: "taxable" },
  { label: "Cash / HYSA",         annualReturn: 0.04, accountType: "taxable" },
  { label: "Roth IRA",            annualReturn: 0.10, accountType: "roth"    },
  { label: "Roth 401(k)",         annualReturn: 0.09, accountType: "roth"    },
  { label: "Traditional 401(k)",  annualReturn: 0.09, accountType: "traditional" },
  { label: "Traditional IRA",     annualReturn: 0.09, accountType: "traditional" },
  { label: "EPF / PPF",           annualReturn: 0.08, accountType: "traditional" },
  { label: "HSA",                 annualReturn: 0.08, accountType: "traditional" },
  { label: "Other",               annualReturn: 0.07, accountType: "taxable" },
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, { label: string; color: string; bg: string }> = {
  taxable:     { label: "Taxable",     color: "oklch(0.62 0.22 270)", bg: "bg-primary/10 text-primary" },
  roth:        { label: "Roth",        color: "oklch(0.65 0.18 150)", bg: "bg-success/10 text-success" },
  traditional: { label: "Traditional", color: "oklch(0.76 0.155 75)", bg: "bg-gold/10 text-gold" },
};

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

export function StepPortfolio() {
  const { inputs, updateInputs } = useFireStore();
  const { assets, inflationRate } = inputs;
  const [expandedAssets, setExpandedAssets] = useState<Set<number>>(new Set([0]));

  const toggleAsset = (idx: number) => {
    setExpandedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalNetWorth = assets.reduce((s, a) => s + a.value, 0);
  const totalMonthlyContributions = assets.reduce((s, a) => s + (a.monthlyContribution ?? 0), 0);
  const weightedNominalReturn =
    totalNetWorth > 0
      ? assets.reduce((s, a) => s + a.annualReturn * a.value, 0) / totalNetWorth
      : inputs.expectedReturn;
  const weightedRealReturn =
    (1 + weightedNominalReturn) / (1 + inflationRate) - 1;

  const updateAsset = (idx: number, patch: Partial<AssetClass>) => {
    updateInputs({
      assets: assets.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    });
  };
  const addAsset = () => {
    const newIdx = assets.length;
    updateInputs({ assets: [...assets, { label: "Stocks / Equity", value: 0, annualReturn: 0.10, accountType: "taxable" }] });
    setExpandedAssets((prev) => new Set([...prev, newIdx]));
  };
  const removeAsset = (idx: number) => {
    updateInputs({ assets: assets.filter((_, i) => i !== idx) });
    setExpandedAssets((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1); });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your net worth</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Break your portfolio into asset classes — each gets its own return rate.
        </p>
      </div>

      {/* Total net worth summary */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="w-4 h-4 text-primary" />
          Total net worth
        </div>
        <span className="text-xl font-bold text-primary tabular-nums">
          {formatCurrency(totalNetWorth)}
        </span>
      </div>

      {/* Asset rows */}
      <div className="space-y-3">
        {assets.map((asset, idx) => {
          const isOpen = expandedAssets.has(idx);
          return (
            <div key={idx} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
              {/* Collapsible header */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => toggleAsset(idx)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="text-sm font-medium truncate">{asset.label}</span>
                  {!isOpen && asset.value > 0 && (
                    <span className="text-xs text-muted-foreground ml-1 shrink-0">
                      {formatCurrency(asset.value)}
                    </span>
                  )}
                </button>
                {!isOpen && (
                  <div className="shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ACCOUNT_TYPE_LABELS[asset.accountType ?? "taxable"].bg}`}>
                      {ACCOUNT_TYPE_LABELS[asset.accountType ?? "taxable"].label}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAsset(idx)}
                  disabled={assets.length <= 1}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  {/* Asset type selector */}
                  <select
                    value={asset.label}
                    onChange={(e) => {
                      const preset = ASSET_PRESETS.find((p) => p.label === e.target.value);
                      updateAsset(idx, {
                        label: e.target.value,
                        ...(preset ? { annualReturn: preset.annualReturn, accountType: preset.accountType } : {}),
                      });
                    }}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1.5 border border-border"
                  >
                    {ASSET_PRESETS.map((p) => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                    {!ASSET_PRESETS.find((p) => p.label === asset.label) && (
                      <option value={asset.label}>{asset.label}</option>
                    )}
                  </select>

                  {/* Account type toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Account type:</span>
                    <div className="flex gap-1">
                      {(["taxable", "roth", "traditional"] as AccountType[]).map((t) => {
                        const cfg = ACCOUNT_TYPE_LABELS[t];
                        const active = (asset.accountType ?? "taxable") === t;
                        return (
                          <button
                            key={t}
                            onClick={() => updateAsset(idx, { accountType: t })}
                            className={`text-xs px-2 py-0.5 rounded-full transition-colors border ${
                              active
                                ? `${cfg.bg} border-current`
                                : "border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <NumberField
                      label="Current value"
                      value={asset.value}
                      onChange={(v) => updateAsset(idx, { value: v })}
                      prefix="$"
                      format="currency"
                      placeholder="e.g. 50,000"
                    />
                    <NumberField
                      label="Annual return"
                      value={asset.annualReturn}
                      onChange={(v) => updateAsset(idx, { annualReturn: v })}
                      format="percent"
                      suffix="%/yr"
                      min={0}
                      max={0.3}
                      placeholder="e.g. 10"
                    />
                    <NumberField
                      label="Monthly investment"
                      value={asset.monthlyContribution ?? 0}
                      onChange={(v) => updateAsset(idx, { monthlyContribution: v || undefined })}
                      prefix="$"
                      format="currency"
                      placeholder="e.g. 500"
                      hint="Ongoing monthly contribution to this asset"
                    />
                  </div>

                  {totalNetWorth > 0 && (
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (asset.value / totalNetWorth) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {((asset.value / totalNetWorth) * 100).toFixed(1)}% of net worth
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addAsset}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add asset class
        </button>
      </div>

      {/* Inflation */}
      <NumberField
        label="Inflation rate"
        icon={<Activity className="w-4 h-4" />}
        value={inflationRate}
        onChange={(v) => updateInputs({ inflationRate: v })}
        format="percent"
        suffix="%/yr"
        min={0}
        max={0.1}
        placeholder="e.g. 3"
        hint="Historical average ~3%. All returns are nominal; engine converts to real."
      />

      {/* Blended return summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
          Blended return summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs block">Weighted nominal</span>
            <span className="font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-primary" />
              {(weightedNominalReturn * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Inflation</span>
            <span className="font-semibold mt-0.5 block">{(inflationRate * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Real return</span>
            <span className="font-semibold mt-0.5 text-success block">
              {(weightedRealReturn * 100).toFixed(2)}%
            </span>
          </div>
          {totalMonthlyContributions > 0 && (
            <div>
              <span className="text-muted-foreground text-xs block">Monthly invest.</span>
              <span className="font-semibold mt-0.5 block">{formatCurrency(totalMonthlyContributions)}/mo</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
