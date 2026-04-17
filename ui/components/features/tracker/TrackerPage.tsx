"use client";
import { useState } from "react";
import { SavingsLog } from "./SavingsLog";
import { TrendingDashboard } from "./TrendingDashboard";
import { motion } from "framer-motion";
import { ClipboardList, TrendingUp } from "lucide-react";

type TrackerTab = "log" | "trending";

export function TrackerPage() {
  const [tab, setTab] = useState<TrackerTab>("log");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          Savings Tracker
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Track your progress
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Log planned vs actual savings each month and see how you&apos;re trending.
        </p>
      </motion.div>

      {/* Sub-tab switcher */}
      <div className="flex justify-center">
        <div className="relative flex gap-1 p-1 rounded-xl bg-muted/20 border border-border/30">
          {(["log", "trending"] as TrackerTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative z-10 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                color: tab === t ? "oklch(0.95 0.01 265)" : "oklch(0.55 0.02 265)",
              }}
            >
              {tab === t && (
                <motion.div
                  layoutId="tracker-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-primary/30 border border-primary/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t === "log" ? (
                  <ClipboardList className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                {t === "log" ? "Monthly Log" : "Trending"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "log" ? <SavingsLog /> : <TrendingDashboard />}
      </motion.div>
    </div>
  );
}
