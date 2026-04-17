"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useFireStore, type WizardStep } from "@/lib/store";
import { StepYou } from "./steps/StepYou";
import { StepIncome } from "./steps/StepIncome";
import { StepPortfolio } from "./steps/StepPortfolio";
import { StepAdvanced } from "./steps/StepAdvanced";
import { StepScenarios } from "./steps/StepScenarios";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Flame } from "lucide-react";

const STEPS: { label: string; shortLabel: string }[] = [
  { label: "You", shortLabel: "You" },
  { label: "Income", shortLabel: "Income" },
  { label: "Portfolio", shortLabel: "Portfolio" },
  { label: "Advanced", shortLabel: "Advanced" },
  { label: "Scenarios", shortLabel: "Goals" },
];

const StepComponents = [StepYou, StepIncome, StepPortfolio, StepAdvanced, StepScenarios];

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function FormWizard() {
  const { wizardStep, setWizardStep, calculate } = useFireStore();
  const [direction, setDirection] = [1, () => {}];

  const StepContent = StepComponents[wizardStep];
  const isLast = wizardStep === STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      calculate();
    } else {
      setWizardStep((wizardStep + 1) as WizardStep);
    }
  };

  const goPrev = () => {
    if (wizardStep > 0) setWizardStep((wizardStep - 1) as WizardStep);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mb-8 justify-center">
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => setWizardStep(i as WizardStep)}
            className="flex items-center gap-1.5 group"
          >
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all duration-200",
                i === wizardStep
                  ? "bg-primary text-primary-foreground scale-110"
                  : i < wizardStep
                  ? "bg-primary/30 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < wizardStep ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs hidden sm:block transition-colors",
                i === wizardStep ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-8 transition-colors",
                  i < wizardStep ? "bg-primary/50" : "bg-border"
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* Step content with animation */}
      <div className="glass rounded-2xl p-6 sm:p-8 min-h-[420px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={wizardStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <StepContent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <button
            onClick={goPrev}
            disabled={wizardStep === 0}
            className={cn(
              "flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-colors",
              wizardStep === 0
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-xs text-muted-foreground">
            {wizardStep + 1} of {STEPS.length}
          </span>

          <button
            onClick={goNext}
            className={cn(
              "flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg font-medium transition-all",
              isLast
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-indigo"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            {isLast ? (
              <>
                <Flame className="w-4 h-4" />
                Calculate FIRE
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
