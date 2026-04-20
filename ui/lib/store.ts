"use client";
import { create } from "zustand";
import type { FireInputs, FireResults } from "./engine/types";
import { calculateFireMonthly } from "./engine/monthly";

export type InputMode = "form" | "chat";
export type WizardStep = 0 | 1 | 2 | 3 | 4;
export type AppTab = "calculator" | "tracker";

export function nextMonthStr(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const DEFAULT_INPUTS: FireInputs = {
  currentAge: 0,
  retirementAge: 0,
  lifeExpectancy: 0,
  grossIncome: 0,
  afterTaxIncome: 0,
  currentSpending: 0,
  savingsGrowthRate: 0,
  salaryGrowthRate: 0,
  currentPortfolio: 0,
  expectedReturn: 0,
  inflationRate: 0,
  withdrawalRate: 0,
  retirementSpending: 0,
  monthlyRetirementSalary: undefined,
  socialSecurityBenefit: 0,
  socialSecurityAge: 0,
  pensionBenefit: 0,
  pensionStartAge: 0,
  effectiveTaxRateAccumulation: 0,
  effectiveTaxRateRetirement: 0,
  healthcarePremium: 0,
  healthcareInflation: 0,
  medicareAge: 0,
  children: [],
  oneTimeEvents: [],
  // Phase 2
  assets: [
    { label: "Stocks / Equity", value: 0, annualReturn: 0.10, accountType: "taxable" as const },
  ],
  emis: [],
  // Phase 3
  savingsStreams: [],
  futureInvestments: [],
  futureExpenses: [],
};

interface FireStore {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;

  wizardStep: WizardStep;
  setWizardStep: (step: WizardStep) => void;

  inputs: FireInputs;
  updateInputs: (partial: Partial<FireInputs>) => void;
  resetInputs: () => void;

  results: FireResults | null;
  hasResults: boolean;
  calculate: () => void;
  // Returns to the wizard with inputs intact so the user can tweak and recalculate
  editInputs: () => void;

  chatCollectedFields: Set<string>;
  markChatField: (field: string) => void;
  chatReady: boolean;
}

export const useFireStore = create<FireStore>((set, get) => ({
  activeTab: "calculator",
  setActiveTab: (tab) => set({ activeTab: tab }),

  inputMode: "form",
  setInputMode: (mode) => set({ inputMode: mode }),

  wizardStep: 0,
  setWizardStep: (step) => set({ wizardStep: step }),

  inputs: DEFAULT_INPUTS,
  updateInputs: (partial) => {
    set((s) => ({ inputs: { ...s.inputs, ...partial } }));
  },
  resetInputs: () => set({ inputs: DEFAULT_INPUTS, results: null, hasResults: false, wizardStep: 0 }),

  results: null,
  hasResults: false,
  calculate: () => {
    const { inputs } = get();
    const results = calculateFireMonthly(inputs);
    set({ results, hasResults: true });
  },
  editInputs: () => set({ hasResults: false }),

  chatCollectedFields: new Set(),
  markChatField: (field) => {
    set((s) => {
      const next = new Set(s.chatCollectedFields);
      next.add(field);
      const requiredFields = [
        "currentAge", "retirementAge", "afterTaxIncome",
        "currentSpending", "currentPortfolio", "retirementSpending",
        "expectedReturn",
      ];
      const chatReady = requiredFields.every((f) => next.has(f));
      return { chatCollectedFields: next, chatReady };
    });
  },
  chatReady: false,
}));
