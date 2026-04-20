"use client";
import { Flame, Calculator, BarChart2, Home } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { ThemeToggle } from "./ThemeToggle";
import { AuthButton } from "./AuthButton";
import { useFireStore } from "@/lib/store";
import type { AppTab } from "@/lib/store";
import { motion } from "framer-motion";

export function Navbar() {
  const { hasResults, resetInputs, activeTab, setActiveTab, wizardStep } = useFireStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={resetInputs}
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Flame className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-semibold tracking-tight text-base">
            FIRE<span className="text-primary">calc</span>
          </span>
        </button>

        {/* Center: app tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/40">
          {(["calculator", "tracker", "home"] as AppTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="nav-tab-pill"
                  className="absolute inset-0 rounded-lg bg-primary/25 border border-primary/35"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 transition-colors ${
                  activeTab === tab ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab === "calculator" ? (
                  <Calculator className="w-4 h-4" />
                ) : tab === "tracker" ? (
                  <BarChart2 className="w-4 h-4" />
                ) : (
                  <Home className="w-4 h-4" />
                )}
                {tab === "calculator" ? "Calculator" : tab === "tracker" ? "Track" : "Home"}
              </span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {activeTab === "calculator" && !hasResults && <ModeToggle />}
          {activeTab === "calculator" && (wizardStep > 0 || hasResults) && (
            <motion.button
              key="start-over"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetInputs}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-full border border-border hover:border-border/80 transition-colors"
            >
              Start over
            </motion.button>
          )}
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
