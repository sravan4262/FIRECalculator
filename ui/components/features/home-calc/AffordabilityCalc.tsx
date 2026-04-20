"use client";
import { useMemo, useState } from "react";
import { NumberField } from "@/components/ui/NumberField";
import { calcAllAffordabilityScenarios, fmt$ } from "./lib/math";
import type { AffordabilityInputs, AffordabilityScenario } from "./lib/types";

const DEFAULTS: AffordabilityInputs = {
  annualIncome: 120000,
  monthlyDebts: 500,
  downPayment: 60000,
  interestRate: 6.5,
  loanTermYears: 30,
  propertyTaxRate: 1.2,
  annualInsurance: 2400,
  monthlyHOA: 0,
};

const SCENARIO_STYLES: Record<string, { pill: string; label: string }> = {
  Conservative: { pill: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20", label: "28% / 36% DTI" },
  Moderate:     { pill: "bg-primary/10 text-primary border border-primary/20",             label: "31% / 43% DTI — FHA guideline" },
  Aggressive:   { pill: "bg-red-500/10 text-red-500 border border-red-500/20",             label: "36% / 50% DTI — lender max" },
};

function StatCard({ label, value, hint, className = "" }: { label: string; value: string; hint: string; className?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold font-mono tracking-tight ${className}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

export function AffordabilityCalc({ inputs: externalInputs, onInputsChange }: {
  inputs?: AffordabilityInputs;
  onInputsChange?: (i: AffordabilityInputs) => void;
}) {
  const [local, setLocal] = useState<AffordabilityInputs>(DEFAULTS);
  const inputs = externalInputs ?? local;
  const set = (patch: Partial<AffordabilityInputs>) => {
    const next = { ...inputs, ...patch };
    setLocal(next);
    onInputsChange?.(next);
  };

  const { scenarios, monthlyIncome } = useMemo(() => ({
    scenarios: calcAllAffordabilityScenarios(inputs),
    monthlyIncome: inputs.annualIncome / 12,
  }), [inputs]);

  const moderate = scenarios[1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      {/* ── Inputs ── */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Your Finances</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Income, debts, and down payment across three lending scenarios.</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground text-[11px]">What is DTI?</p>
            <p><strong className="text-foreground">Debt-to-Income (DTI)</strong> is your total monthly debt payments divided by gross monthly income. <strong className="text-foreground">Front-end</strong> covers just the housing payment; <strong className="text-foreground">back-end</strong> covers housing plus all other debts.</p>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Income & Debts</p>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">What to enter here</p>
            <p>Use your total household gross (pre-tax) income. For monthly debts, include every recurring payment — car loan, student loan, credit card minimums. The calculator uses these to stay within lender debt-to-income limits.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Annual Income" value={inputs.annualIncome} onChange={(v) => set({ annualIncome: v })} prefix="$" format="currency" hint="Combined pre-tax household income per year" />
            <NumberField label="Monthly Debts" value={inputs.monthlyDebts} onChange={(v) => set({ monthlyDebts: v })} prefix="$" suffix="/mo" format="currency" hint="Car, student loans, credit card minimums" />
            <NumberField label="Down Payment" value={inputs.downPayment} onChange={(v) => set({ downPayment: v })} prefix="$" format="currency" hint="Upfront cash — 20% of price avoids PMI" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loan Assumptions</p>
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">What to enter here</p>
            <p>These come from your lender or the listing. Property tax rate varies by county — check your target area&apos;s public records (typically 0.5–2.5%). Home insurance is usually $100–250/mo. HOA is on the listing if applicable.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Interest Rate" value={inputs.interestRate} onChange={(v) => set({ interestRate: v })} suffix="%" hint="Fixed rate quoted by your lender" />
            <NumberField label="Loan Term" value={inputs.loanTermYears} onChange={(v) => set({ loanTermYears: v })} suffix="yrs" hint="30yr = lower payment; 15yr = less total interest" />
            <NumberField label="Property Tax" value={inputs.propertyTaxRate} onChange={(v) => set({ propertyTaxRate: v })} suffix="%/yr" hint="Annual tax as % of home price (check county records)" />
            <NumberField label="Home Insurance" value={inputs.annualInsurance} onChange={(v) => set({ annualInsurance: v })} prefix="$" suffix="/yr" format="currency" hint="Typically $1,200–3,000/yr depending on location" />
            <NumberField label="HOA" value={inputs.monthlyHOA} onChange={(v) => set({ monthlyHOA: v })} prefix="$" suffix="/mo" format="currency" hint="Monthly fee for condos/communities — 0 if none" />
          </div>

          <button
            onClick={() => { setLocal(DEFAULTS); onInputsChange?.(DEFAULTS); }}
            className="w-full text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg py-1.5 transition-colors"
          >
            Reset defaults
          </button>
        </div>

        {/* Scenarios explained */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground text-[11px] uppercase tracking-wide">The three scenarios</p>
          <ul className="space-y-1.5">
            <li><span className="font-medium text-emerald-600">Conservative</span> — 28/36 rule, widely recommended for first-time buyers.</li>
            <li><span className="font-medium text-primary">Moderate</span> — FHA guidelines (31/43), most common approval threshold.</li>
            <li><span className="font-medium text-red-500">Aggressive</span> — Maximum most lenders approve (36/50), little cushion.</li>
          </ul>
          <p className="pt-1 border-t border-border">Lender approval not guaranteed at any DTI. Credit score, employment history, and reserves all affect eligibility.</p>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Conservative Max" value={fmt$(scenarios[0].homePrice)} hint="28% / 36% DTI" className="text-emerald-600" />
          <StatCard label="Moderate Max" value={fmt$(scenarios[1].homePrice)} hint="31% / 43% DTI" className="text-primary" />
          <StatCard label="Aggressive Max" value={fmt$(scenarios[2].homePrice)} hint="36% / 50% DTI" className="text-red-500" />
          <StatCard label="Monthly Income" value={fmt$(monthlyIncome)} hint="Gross (pre-tax) per month" />
        </div>

        {/* Scenario comparison table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Scenario Comparison</h3>
            <p className="text-xs text-muted-foreground mt-0.5">How much home, loan, and payment each DTI scenario allows.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 620 }}>
              <thead>
                <tr className="bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 text-left">Scenario</th>
                  <th className="px-3 py-3 text-right">Front / Back DTI</th>
                  <th className="px-3 py-3 text-right">Max PITI</th>
                  <th className="px-3 py-3 text-right text-red-500">P&I Payment</th>
                  <th className="px-3 py-3 text-right">Max Loan</th>
                  <th className="px-3 py-3 text-right text-emerald-600 font-bold">Max Home Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {scenarios.map((s: AffordabilityScenario) => {
                  const style = SCENARIO_STYLES[s.label];
                  return (
                    <tr key={s.label} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${style.pill}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {(s.frontDTI * 100).toFixed(0)}% / {(s.backDTI * 100).toFixed(0)}%
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmt$(s.maxPITI)}/mo</td>
                      <td className="px-3 py-3 text-right font-mono text-red-500">{fmt$(s.maxPI)}/mo</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{fmt$(s.maxLoan)}</td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-600 font-bold">{fmt$(s.homePrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Column guide</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              <li><span className="font-medium text-foreground">Front / Back DTI</span> — Front-end: housing payment ÷ income. Back-end: (housing + all debts) ÷ income.</li>
              <li><span className="font-medium text-foreground">Max PITI</span> — Maximum monthly housing payment allowed under this scenario (Principal + Interest + Taxes + Insurance + HOA).</li>
              <li><span className="font-medium text-red-500">P&I Payment</span> — The mortgage-only portion of PITI — what goes to the lender each month.</li>
              <li><span className="font-medium text-foreground">Max Loan</span> — Largest loan the lender will approve, derived from the Max PITI after subtracting tax, insurance, and HOA.</li>
              <li><span className="font-medium text-emerald-600">Max Home Price</span> — Max Loan + your Down Payment. The most expensive home you can buy under this scenario.</li>
            </ul>
            <p className="pt-1 border-t border-border">Lender approval not guaranteed at any DTI. Credit score, employment history, and cash reserves all affect eligibility.</p>
          </div>
        </div>

        {/* Payment breakdown (moderate) */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Monthly Payment Breakdown <span className="text-muted-foreground font-normal text-xs">(Moderate scenario)</span></h3>
            <p className="text-xs text-muted-foreground mt-0.5">Where your monthly housing dollar goes under the moderate scenario.</p>
          </div>

          <div className="space-y-0 divide-y divide-border">
            {[
              { label: "Principal & Interest", value: fmt$(moderate.maxPI) + "/mo" },
              { label: "Property Tax", value: fmt$(moderate.monthlyTax) + "/mo" },
              { label: "Home Insurance", value: fmt$(moderate.monthlyIns) + "/mo" },
              { label: "HOA", value: fmt$(moderate.monthlyHOA) + "/mo" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="font-mono text-sm">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3">
              <span className="font-bold text-sm">Total Monthly PITI</span>
              <span className="font-mono font-bold text-primary text-base">{fmt$(moderate.maxPITI)}/mo</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3 grid grid-cols-2 gap-3 text-xs">
            <div><span className="font-semibold text-foreground">Front-End DTI:</span> <span className="text-muted-foreground">Housing PITI ÷ gross income. Under 31% preferred.</span></div>
            <div><span className="font-semibold text-foreground">Back-End DTI:</span> <span className="text-muted-foreground">(PITI + all debts) ÷ income. Capped at 43–50%.</span></div>
            <div><span className="font-semibold text-foreground">Your Front-End:</span> <span className="font-mono text-foreground">{(moderate.dtiF * 100).toFixed(1)}%</span></div>
            <div><span className="font-semibold text-foreground">Your Back-End:</span> <span className="font-mono text-foreground">{(moderate.dtiB * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
