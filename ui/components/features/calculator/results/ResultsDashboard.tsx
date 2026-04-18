"use client";
import { useState, useCallback, useEffect } from "react";
import { useFireStore } from "@/lib/store";
import { StatCard } from "./StatCard";
import { PortfolioChart } from "./PortfolioChart";
import { FireVariants } from "./FireVariants";
import { YearlyTable } from "./YearlyTable";
import { SensitivityTable } from "./SensitivityTable";
import { WhatIfPanel } from "./WhatIfPanel";
import { AccountSequencingPanel } from "./AccountSequencingPanel";
import { MonteCarloPanel } from "./MonteCarloPanel";
import { FireCelebration } from "./FireCelebration";
import { ShareButton } from "./ShareButton";
import { SavePlanButton } from "@/components/features/plans/SavePlanButton";
import { PlansDrawer } from "@/components/features/plans/PlansDrawer";
import { runMonteCarlo } from "@/lib/engine/monteCarlo";
import { HISTORICAL_SCENARIOS, runHistoricalSequence } from "@/lib/engine/historicalSequences";
import { formatCurrency, formatPct } from "@/lib/utils";
import type { FireResults, MonteCarloResults, HistoricalSequenceResult } from "@/lib/engine/types";
import {
  Flame, Target, Clock, TrendingUp, AlertTriangle,
  Hourglass, Shield, ArrowUpRight, Pencil, Shuffle, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export function ResultsDashboard() {
  const { results, inputs, editInputs } = useFireStore();
  const [whatIfResults, setWhatIfResults] = useState<FireResults | null>(null);
  const [mcEnabled, setMcEnabled] = useState(false);
  const [mcRunning, setMcRunning] = useState(false);
  const [mcResults, setMcResults] = useState<MonteCarloResults | null>(null);
  const [historicalResults, setHistoricalResults] = useState<HistoricalSequenceResult[]>([]);

  const handleWhatIfChange = useCallback((r: FireResults | null) => {
    setWhatIfResults(r);
  }, []);

  // Run MC when enabled (deferred to avoid blocking render)
  useEffect(() => {
    if (!mcEnabled || !results) { setMcResults(null); setHistoricalResults([]); return; }
    setMcRunning(true);
    const id = setTimeout(() => {
      const mc = runMonteCarlo(inputs);
      const hist = HISTORICAL_SCENARIOS.map((s) => runHistoricalSequence(inputs, s));
      setMcResults(mc);
      setHistoricalResults(hist);
      setMcRunning(false);
    }, 0);
    return () => clearTimeout(id);
  }, [mcEnabled, results, inputs]);

  if (!results) return null;

  const realAnnualReturn = (1 + inputs.expectedReturn) / (1 + inputs.inflationRate) - 1;

  const fireAgeDisplay = results.fireAge ? `Age ${results.fireAge}` : "Not reached";
  const yearsDisplay = results.yearsToFire ? `${results.yearsToFire} yrs` : "—";
  const gapPositive = results.gapAtTargetAge >= 0;

  const monthlyRetirementSalary =
    inputs.monthlyRetirementSalary ?? inputs.retirementSpending / 12;
  const pvLabel = results.requiredCorpusPV > 0
    ? formatCurrency(results.requiredCorpusPV)
    : "—";
  const depletionDisplay = results.depletionAge
    ? `Age ${results.depletionAge}`
    : `${inputs.lifeExpectancy}+`;
  const nominalMonthly = results.nominalRetirementSalary;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* FIRE celebration — renders once if fireAge is set */}
      <FireCelebration fireAge={results.fireAge} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-4 space-y-3"
      >
        {/* Action buttons row */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setMcEnabled((v) => !v)}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
              mcEnabled
                ? "text-primary border-primary/50 bg-primary/10 hover:bg-primary/15"
                : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {mcRunning
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Shuffle className="w-3.5 h-3.5" />}
            Certainty Check
          </button>
          <ShareButton results={results} inputs={inputs} />
          <SavePlanButton inputs={inputs} />
          <PlansDrawer />
          <button
            onClick={editInputs}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Your FIRE plan
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-primary tabular-nums">
          {formatCurrency(results.fireNumber)}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Withdrawal-rate target · PV corpus{" "}
          <span className="text-foreground font-medium">{pvLabel}</span>
        </p>
        {/* MC success rate badge */}
        {mcResults && !mcRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              borderColor: mcResults.successRate >= 0.9 ? "oklch(0.65 0.18 150 / 50%)" : mcResults.successRate >= 0.75 ? "oklch(0.76 0.155 75 / 50%)" : "oklch(0.65 0.20 25 / 50%)",
              background: mcResults.successRate >= 0.9 ? "oklch(0.65 0.18 150 / 10%)" : mcResults.successRate >= 0.75 ? "oklch(0.76 0.155 75 / 10%)" : "oklch(0.65 0.20 25 / 10%)",
              color: mcResults.successRate >= 0.9 ? "oklch(0.65 0.18 150)" : mcResults.successRate >= 0.75 ? "oklch(0.76 0.155 75)" : "oklch(0.65 0.20 25)",
            }}
          >
            <Shuffle className="w-3 h-3" />
            {Math.round(mcResults.successRate * 100)}% chance of not running out
          </motion.div>
        )}
        </div>
      </motion.div>

      {/* Hero stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="FIRE number"
          value={formatCurrency(results.fireNumber)}
          gold
          delay={0}
          icon={<Flame className="w-4 h-4" />}
        />
        <StatCard
          label="Retire at"
          value={fireAgeDisplay}
          subValue={
            results.fireAge
              ? `Year ${new Date().getFullYear() + Math.round(results.fireAge - inputs.currentAge)}`
              : undefined
          }
          highlight
          delay={0.06}
          icon={<Target className="w-4 h-4" />}
        />
        <StatCard
          label="Years to FIRE"
          value={yearsDisplay}
          subValue={`From age ${inputs.currentAge}`}
          delay={0.12}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Savings rate"
          value={formatPct(results.currentSavingsRate)}
          subValue="of after-tax income"
          delay={0.18}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="PV corpus needed"
          value={pvLabel}
          subValue={`${formatCurrency(monthlyRetirementSalary)}/mo target`}
          delay={0.24}
          icon={<Shield className="w-4 h-4" />}
        />
        <StatCard
          label="Money lasts until"
          value={depletionDisplay}
          subValue={results.depletionAge ? "corpus depletes" : "past life expectancy"}
          delay={0.30}
          icon={<Hourglass className="w-4 h-4" />}
        />
      </div>

      {/* Nominal salary callout */}
      {nominalMonthly > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34 }}
          className="rounded-xl border border-border bg-muted/20 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-4 h-4 text-gold shrink-0" />
            <div className="text-sm">
              <p className="font-medium">
                Today&apos;s{" "}
                <span className="text-primary">{formatCurrency(monthlyRetirementSalary)}/mo</span>{" "}
                target =
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inflation-adjusted at age {inputs.retirementAge}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-gold tabular-nums">
              {formatCurrency(nominalMonthly)}/mo
            </p>
            <p className="text-xs text-muted-foreground">nominal</p>
          </div>
        </motion.div>
      )}

      {/* Gap alerts */}
      {!gapPositive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-warning">Shortfall at target retirement age</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              You&apos;ll be{" "}
              <span className="text-foreground font-medium">
                {formatCurrency(Math.abs(results.gapAtTargetAge))}
              </span>{" "}
              short of your FIRE number at age {inputs.retirementAge}.{" "}
              {results.fireAge
                ? `You hit FIRE at age ${results.fireAge} instead.`
                : "Consider increasing savings or reducing spending."}
            </p>
          </div>
        </motion.div>
      )}
      {gapPositive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-start gap-3"
        >
          <span className="text-lg">🎉</span>
          <div className="text-sm">
            <p className="font-medium text-success">On track — with a cushion!</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              At age {inputs.retirementAge}, you&apos;ll have{" "}
              <span className="text-foreground font-medium">
                {formatCurrency(results.gapAtTargetAge)}
              </span>{" "}
              more than your FIRE number. That&apos;s a{" "}
              {formatPct(results.gapAtTargetAge / results.fireNumber)} buffer.
            </p>
          </div>
        </motion.div>
      )}

      {/* PV vs WR callout */}
      {Math.abs(results.requiredCorpusPV - results.fireNumber) / results.fireNumber > 0.05 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"
        >
          <p className="font-medium text-primary mb-1">Withdrawal-rate vs PV corpus</p>
          <p className="text-muted-foreground text-xs">
            The 4% rule gives{" "}
            <span className="text-foreground font-medium">{formatCurrency(results.fireNumber)}</span>.
            The PV formula — funding{" "}
            <span className="text-foreground font-medium">
              {formatCurrency(monthlyRetirementSalary)}/mo
            </span>{" "}
            for {inputs.lifeExpectancy - inputs.retirementAge} years — gives{" "}
            <span className="text-foreground font-medium">{pvLabel}</span>.
            {results.requiredCorpusPV < results.fireNumber
              ? " PV says you need less; the 4% rule is more conservative."
              : " PV says you need more; a lower real return demands a larger corpus."}
          </p>
        </motion.div>
      )}

      {/* Chart — shows what-if overlay and MC fan when active */}
      <PortfolioChart
        rows={results.yearlyRows}
        fireNumber={results.fireNumber}
        fireAge={results.fireAge}
        retirementAge={inputs.retirementAge}
        whatIfRows={whatIfResults?.yearlyRows}
        whatIfFireAge={whatIfResults?.fireAge}
        monteCarloRows={mcResults?.percentileRows}
      />

      {/* What-if explorer */}
      <WhatIfPanel
        baseInputs={inputs}
        baseResults={results}
        onWhatIfChange={handleWhatIfChange}
      />

      {/* Monte Carlo panel */}
      {mcResults && !mcRunning && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MonteCarloPanel
            mc={mcResults}
            historicalResults={historicalResults}
            retirementAge={inputs.retirementAge}
            lifeExpectancy={inputs.lifeExpectancy}
          />
        </motion.div>
      )}

      {/* Account sequencing */}
      <AccountSequencingPanel
        seq={results.accountSequencing}
        retirementAge={inputs.retirementAge}
      />

      {/* FIRE variants */}
      <div className="glass rounded-2xl p-5">
        <FireVariants
          results={results}
          currentAge={inputs.currentAge}
          realAnnualReturn={realAnnualReturn}
        />
      </div>

      {/* Retirement age sensitivity table */}
      {results.retirementSensitivity?.length > 0 && (
        <SensitivityTable
          rows={results.retirementSensitivity}
          plannedRetirementAge={inputs.retirementAge}
        />
      )}

      {/* Year-by-year table */}
      <YearlyTable rows={results.yearlyRows} fireAge={results.fireAge} />
    </div>
  );
}
