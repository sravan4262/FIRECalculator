"use client";
import { useFireStore, nextMonthStr, currentMonthStr } from "@/lib/store";
import { NumberField } from "@/components/ui/NumberField";
import { useState } from "react";
import {
  ChevronDown, ChevronRight, Heart, Shield, GraduationCap,
  CreditCard, Plus, Trash2, Banknote, ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmiStream, FutureExpense, ChildOneTimeExpense } from "@/lib/engine/types";

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

export function StepAdvanced() {
  const { inputs, updateInputs } = useFireStore();

  // ── EMI helpers ────────────────────────────────────────────────────────────
  const addEmi = () => {
    updateInputs({
      emis: [
        ...(inputs.emis ?? []),
        {
          label: `Loan ${(inputs.emis?.length ?? 0) + 1}`,
          monthlyAmount: 0,
          endDate: nextMonthStr(),
          redirectToSavings: false,
        } satisfies EmiStream,
      ],
    });
  };
  const removeEmi = (idx: number) => {
    updateInputs({ emis: (inputs.emis ?? []).filter((_, i) => i !== idx) });
  };
  const updateEmi = (idx: number, patch: Partial<EmiStream>) => {
    updateInputs({
      emis: (inputs.emis ?? []).map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    });
  };

  // ── Future expense helpers ─────────────────────────────────────────────────
  const addExpense = () => {
    updateInputs({
      futureExpenses: [
        ...(inputs.futureExpenses ?? []),
        {
          label: "Expense",
          monthlyAmount: 500,
          startDate: currentMonthStr(),
          endDate: "",
        } satisfies FutureExpense,
      ],
    });
  };
  const removeExpense = (idx: number) => {
    updateInputs({ futureExpenses: (inputs.futureExpenses ?? []).filter((_, i) => i !== idx) });
  };
  const updateExpense = (idx: number, patch: Partial<FutureExpense>) => {
    updateInputs({
      futureExpenses: (inputs.futureExpenses ?? []).map((e, i) =>
        i === idx ? { ...e, ...patch } : e
      ),
    });
  };

  // ── Child helpers ─────────────────────────────────────────────────────────
  const addChild = () => {
    updateInputs({
      children: [
        ...(inputs.children ?? []),
        {
          label: `Child ${(inputs.children?.length ?? 0) + 1}`,
          currentAge: 5,
          educationStartAge: 18,
          educationEndAge: 22,
          annualCostToday: 30000,
          educationInflation: 0.05,
          monthlyLivingExpenses: 0,
          livingEndAge: 22,
          oneTimeExpenses: [],
        },
      ],
    });
  };
  const removeChild = (idx: number) => {
    updateInputs({ children: (inputs.children ?? []).filter((_, i) => i !== idx) });
  };
  const updateChild = (idx: number, patch: object) => {
    updateInputs({
      children: (inputs.children ?? []).map((c, i) =>
        i === idx ? { ...c, ...patch } : c
      ),
    });
  };
  const addOneTime = (childIdx: number) => {
    const child = (inputs.children ?? [])[childIdx];
    if (!child) return;
    const ote: ChildOneTimeExpense = {
      label: "One-time expense",
      date: currentMonthStr(),
      amount: 10000,
    };
    updateChild(childIdx, { oneTimeExpenses: [...(child.oneTimeExpenses ?? []), ote] });
  };
  const removeOneTime = (childIdx: number, oteIdx: number) => {
    const child = (inputs.children ?? [])[childIdx];
    if (!child) return;
    updateChild(childIdx, {
      oneTimeExpenses: (child.oneTimeExpenses ?? []).filter((_, i) => i !== oteIdx),
    });
  };
  const updateOneTime = (childIdx: number, oteIdx: number, patch: Partial<ChildOneTimeExpense>) => {
    const child = (inputs.children ?? [])[childIdx];
    if (!child) return;
    updateChild(childIdx, {
      oneTimeExpenses: (child.oneTimeExpenses ?? []).map((o, i) =>
        i === oteIdx ? { ...o, ...patch } : o
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Advanced inputs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All optional — skip anything that doesn&apos;t apply to you.
        </p>
      </div>

      {/* Retirement spending */}
      <Section title="Retirement spending" icon={<Shield className="w-4 h-4" />} defaultOpen>
        <NumberField
          label="Monthly retirement salary"
          value={inputs.monthlyRetirementSalary ?? inputs.retirementSpending / 12}
          onChange={(v) => updateInputs({ monthlyRetirementSalary: v, retirementSpending: v * 12 })}
          prefix="$"
          format="currency"
          hint="Monthly take-home you need in retirement (today's dollars). Used for PV corpus."
        />
        <NumberField
          label="Withdrawal rate"
          value={inputs.withdrawalRate}
          onChange={(v) => updateInputs({ withdrawalRate: v })}
          format="percent"
          suffix="%"
          min={0.02}
          max={0.08}
          hint="4% is the classic 'safe' withdrawal rate"
        />
      </Section>

      {/* EMI management */}
      <Section title="EMIs & loans" icon={<CreditCard className="w-4 h-4" />}>
        <p className="text-xs text-muted-foreground">
          Active EMIs are deducted from your monthly savings. Tick &quot;redirect&quot; to
          channel freed-up cash back to savings after payoff.
        </p>
        <div className="space-y-4">
          {(inputs.emis ?? []).map((emi, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent text-sm font-medium border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={emi.label}
                  onChange={(e) => updateEmi(idx, { label: e.target.value })}
                  placeholder="EMI label"
                />
                <button onClick={() => removeEmi(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Monthly EMI"
                  value={emi.monthlyAmount}
                  onChange={(v) => updateEmi(idx, { monthlyAmount: v })}
                  prefix="$"
                  format="currency"
                />
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">End date</label>
                  <input
                    type="month"
                    value={emi.endDate}
                    onChange={(e) => updateEmi(idx, { endDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emi.redirectToSavings}
                  onChange={(e) => updateEmi(idx, { redirectToSavings: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  Redirect freed EMI to savings after payoff
                </span>
              </label>
            </div>
          ))}
          <button onClick={addEmi}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Add EMI
          </button>
        </div>
      </Section>

      {/* Future expenses */}
      <Section title="Future expense streams" icon={<Banknote className="w-4 h-4" />}>
        <p className="text-xs text-muted-foreground">
          Date-gated recurring expenses — travel budget, insurance, club memberships, etc.
          Deducted from monthly savings while active.
        </p>
        <div className="space-y-4">
          {(inputs.futureExpenses ?? []).map((exp, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent text-sm font-medium border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={exp.label}
                  onChange={(e) => updateExpense(idx, { label: e.target.value })}
                  placeholder="e.g. Annual travel, Insurance"
                />
                <button onClick={() => removeExpense(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <NumberField
                label="Monthly amount"
                value={exp.monthlyAmount}
                onChange={(v) => updateExpense(idx, { monthlyAmount: v })}
                prefix="$"
                format="currency"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Start date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExpense(idx, { startDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">End date (optional)</label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExpense(idx, { endDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addExpense}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Add future expense
          </button>
        </div>
      </Section>

      {/* Social Security / Pension */}
      <Section title="Other retirement income" icon={<Shield className="w-4 h-4" />}>
        <NumberField
          label="Social Security / NPS annual benefit"
          value={inputs.socialSecurityBenefit ?? 0}
          onChange={(v) => updateInputs({ socialSecurityBenefit: v })}
          prefix="$" format="currency"
          hint="Annual SS benefit at your claiming age (from ssa.gov)"
        />
        <NumberField
          label="SS / NPS claiming age"
          value={inputs.socialSecurityAge ?? 67}
          onChange={(v) => updateInputs({ socialSecurityAge: v })}
          suffix="years" min={55} max={70}
        />
        <NumberField
          label="Pension annual benefit"
          value={inputs.pensionBenefit ?? 0}
          onChange={(v) => updateInputs({ pensionBenefit: v })}
          prefix="$" format="currency"
        />
        <NumberField
          label="Pension start age"
          value={inputs.pensionStartAge ?? 65}
          onChange={(v) => updateInputs({ pensionStartAge: v })}
          suffix="years" min={50} max={75}
        />
      </Section>

      {/* Healthcare */}
      <Section title="Healthcare" icon={<Heart className="w-4 h-4" />}>
        <NumberField
          label="Annual healthcare premium (pre-Medicare)"
          value={inputs.healthcarePremium ?? 0}
          onChange={(v) => updateInputs({ healthcarePremium: v })}
          prefix="$" format="currency"
          hint="ACA marketplace premiums before age 65"
        />
        <NumberField
          label="Healthcare inflation rate"
          value={inputs.healthcareInflation ?? 0.05}
          onChange={(v) => updateInputs({ healthcareInflation: v })}
          format="percent" suffix="%/yr" min={0} max={0.15}
        />
        <NumberField
          label="Medicare start age"
          value={inputs.medicareAge ?? 65}
          onChange={(v) => updateInputs({ medicareAge: v })}
          suffix="years" min={60} max={70}
        />
      </Section>

      {/* Kids education + living expenses */}
      <Section title="Children's education & living expenses" icon={<GraduationCap className="w-4 h-4" />}>
        <div className="space-y-5">
          {(inputs.children ?? []).map((child, idx) => (
            <div key={idx} className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{child.label}</span>
                <button onClick={() => removeChild(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Core education fields */}
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Child's current age"
                  value={child.currentAge}
                  onChange={(v) => updateChild(idx, { currentAge: v })}
                  suffix="yrs" min={0} max={25}
                />
                <NumberField
                  label="Annual education cost (today $)"
                  value={child.annualCostToday}
                  onChange={(v) => updateChild(idx, { annualCostToday: v })}
                  prefix="$" format="currency"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Education start age"
                  value={child.educationStartAge}
                  onChange={(v) => updateChild(idx, { educationStartAge: v })}
                  suffix="yrs" min={0} max={30}
                />
                <NumberField
                  label="Education end age"
                  value={child.educationEndAge}
                  onChange={(v) => updateChild(idx, { educationEndAge: v })}
                  suffix="yrs" min={0} max={30}
                />
              </div>
              <NumberField
                label="Education inflation"
                value={child.educationInflation}
                onChange={(v) => updateChild(idx, { educationInflation: v })}
                format="percent" suffix="%/yr" min={0} max={0.2}
              />

              {/* Phase 3: monthly living expenses */}
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Monthly living expenses</p>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Monthly amount"
                    value={child.monthlyLivingExpenses ?? 0}
                    onChange={(v) => updateChild(idx, { monthlyLivingExpenses: v })}
                    prefix="$" format="currency"
                    hint="Groceries, clothing, activities, etc."
                  />
                  <NumberField
                    label="Living expenses until age"
                    value={child.livingEndAge ?? child.educationEndAge}
                    onChange={(v) => updateChild(idx, { livingEndAge: v })}
                    suffix="yrs" min={0} max={30}
                  />
                </div>
              </div>

              {/* Phase 3: one-time expenses */}
              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-xs font-medium text-muted-foreground">One-time expenses</p>
                {(child.oneTimeExpenses ?? []).map((ote, oteIdx) => (
                  <div key={oteIdx} className="flex items-end gap-2">
                    <div className="flex-1">
                      <input
                        className="w-full bg-transparent text-xs border border-border rounded px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={ote.label}
                        onChange={(e) => updateOneTime(idx, oteIdx, { label: e.target.value })}
                        placeholder="e.g. Wedding"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <NumberField
                          label="Amount"
                          value={ote.amount}
                          onChange={(v) => updateOneTime(idx, oteIdx, { amount: v })}
                          prefix="$" format="currency"
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Date</label>
                          <input
                            type="month"
                            value={ote.date}
                            onChange={(e) => updateOneTime(idx, oteIdx, { date: e.target.value })}
                            className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeOneTime(idx, oteIdx)}
                      className="text-muted-foreground hover:text-destructive transition-colors mb-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOneTime(idx)}
                  className={cn("flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors")}
                >
                  <Plus className="w-3.5 h-3.5" /> Add one-time expense
                </button>
              </div>
            </div>
          ))}

          <button onClick={addChild}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> Add a child
          </button>
        </div>
      </Section>

      {/* Taxes */}
      <Section title="Tax assumptions" icon={<Shield className="w-4 h-4" />}>
        <NumberField
          label="Effective tax rate during retirement"
          value={inputs.effectiveTaxRateRetirement ?? 0.12}
          onChange={(v) => updateInputs({ effectiveTaxRateRetirement: v })}
          format="percent" suffix="%" min={0} max={0.5}
          hint="Effective rate on withdrawals in retirement"
        />
        <NumberField
          label="Effective tax rate now (accumulation)"
          value={inputs.effectiveTaxRateAccumulation ?? 0.22}
          onChange={(v) => updateInputs({ effectiveTaxRateAccumulation: v })}
          format="percent" suffix="%" min={0} max={0.5}
        />
      </Section>

      {/* Roth conversion ladder */}
      <Section title="Roth conversion ladder" icon={<ArrowRightLeft className="w-4 h-4" />}>
        <p className="text-xs text-muted-foreground">
          Each year during accumulation, convert this amount from your Traditional accounts to
          Roth. Conversions are taxed today but unlock after a 5-year seasoning period — creating
          a tax-free bridge before age 59½.
        </p>
        <NumberField
          label="Annual Roth conversion amount"
          value={inputs.rothConversionAnnual ?? 0}
          onChange={(v) => updateInputs({ rothConversionAnnual: v })}
          prefix="$"
          format="currency"
          hint="Set to $0 to skip. Requires Traditional account assets on the Portfolio step."
        />
        {(inputs.rothConversionAnnual ?? 0) > 0 && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-primary">How the ladder works</p>
            <p>Year 1 conversion → accessible at year 6 (age {(inputs.currentAge + 6).toFixed(0)}+)</p>
            <p>Year 2 conversion → accessible at year 7, and so on.</p>
            <p>Each tranche is penalty-free and tax-free once unlocked.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
