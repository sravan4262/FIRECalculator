"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MoneyAccount,
  MoneyCategory,
  Transaction,
  RecurrenceRule,
  CategoryBudget,
} from "./types";
import { pendingOccurrences, todayYmd } from "./recurrence";

const PALETTE = [
  "oklch(0.65 0.22 25)",
  "oklch(0.72 0.18 50)",
  "oklch(0.80 0.16 95)",
  "oklch(0.72 0.18 145)",
  "oklch(0.70 0.15 195)",
  "oklch(0.65 0.22 270)",
  "oklch(0.60 0.20 320)",
  "oklch(0.66 0.12 30)",
  "oklch(0.68 0.05 265)",
];

const DEFAULT_ACCOUNTS: MoneyAccount[] = [
  { id: "acct-cash", name: "Cash", type: "cash", sortOrder: 0 },
  { id: "acct-card", name: "Card", type: "card", sortOrder: 1 },
];

const DEFAULT_CATEGORIES: MoneyCategory[] = [
  { id: "cat-salary", label: "Salary", color: PALETTE[3], kind: "income", sortOrder: 0 },
  { id: "cat-bonus", label: "Bonus", color: PALETTE[4], kind: "income", sortOrder: 1 },
  { id: "cat-other-income", label: "Other Income", color: PALETTE[8], kind: "income", sortOrder: 2 },

  { id: "cat-utilities", label: "Utilities", color: PALETTE[0], kind: "expense", sortOrder: 0 },
  { id: "cat-travel", label: "Travel", color: PALETTE[1], kind: "expense", sortOrder: 1 },
  { id: "cat-auto", label: "Auto", color: PALETTE[2], kind: "expense", sortOrder: 2 },
  { id: "cat-dining", label: "Dining", color: PALETTE[6], kind: "expense", sortOrder: 3 },
  { id: "cat-coffee", label: "Coffee", color: PALETTE[7], kind: "expense", sortOrder: 4 },
  { id: "cat-subscriptions", label: "Subscriptions", color: PALETTE[5], kind: "expense", sortOrder: 5 },
  { id: "cat-shopping", label: "Shopping", color: PALETTE[4], kind: "expense", sortOrder: 6 },
  { id: "cat-other-expense", label: "Other", color: PALETTE[8], kind: "expense", sortOrder: 7 },
];

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface MoneyStore {
  accounts: MoneyAccount[];
  categories: MoneyCategory[];
  transactions: Transaction[];
  recurrenceRules: RecurrenceRule[];
  budgets: CategoryBudget[];

  addTransaction: (tx: Omit<Transaction, "id">) => Transaction;
  updateTransaction: (id: string, partial: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addRecurrenceRule: (rule: Omit<RecurrenceRule, "id">) => RecurrenceRule;
  updateRecurrenceRule: (id: string, partial: Partial<RecurrenceRule>) => void;
  deleteRecurrenceRule: (id: string, alsoDeleteGenerated?: boolean) => void;

  addCategory: (cat: Omit<MoneyCategory, "id" | "sortOrder">) => MoneyCategory;
  removeCategory: (id: string) => void;

  addAccount: (acct: Omit<MoneyAccount, "id" | "sortOrder">) => MoneyAccount;
  removeAccount: (id: string) => void;

  setBudget: (month: string, categoryId: string, amount: number) => void;
  getBudget: (month: string, categoryId: string) => number;

  materializeRecurring: (asOfYmd?: string) => void;
  resetAll: () => void;
}

export const useMoneyStore = create<MoneyStore>()(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      recurrenceRules: [],
      budgets: [],

      addTransaction: (tx) => {
        const created: Transaction = { ...tx, id: uid("tx") };
        set((s) => ({ transactions: [...s.transactions, created] }));
        return created;
      },

      updateTransaction: (id, partial) => {
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...partial } : t)),
        }));
      },

      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
      },

      addRecurrenceRule: (rule) => {
        const created: RecurrenceRule = { ...rule, id: uid("rule") };
        set((s) => ({ recurrenceRules: [...s.recurrenceRules, created] }));
        get().materializeRecurring();
        return created;
      },

      updateRecurrenceRule: (id, partial) => {
        set((s) => ({
          recurrenceRules: s.recurrenceRules.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        }));
      },

      deleteRecurrenceRule: (id, alsoDeleteGenerated = false) => {
        set((s) => ({
          recurrenceRules: s.recurrenceRules.filter((r) => r.id !== id),
          transactions: alsoDeleteGenerated
            ? s.transactions.filter((t) => t.recurrenceId !== id)
            : s.transactions.map((t) =>
                t.recurrenceId === id ? { ...t, recurrenceId: undefined } : t
              ),
        }));
      },

      addCategory: (cat) => {
        const sortOrder = get().categories.filter((c) => c.kind === cat.kind).length;
        const created: MoneyCategory = { ...cat, id: uid("cat"), sortOrder };
        set((s) => ({ categories: [...s.categories, created] }));
        return created;
      },

      removeCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },

      addAccount: (acct) => {
        const created: MoneyAccount = { ...acct, id: uid("acct"), sortOrder: get().accounts.length };
        set((s) => ({ accounts: [...s.accounts, created] }));
        return created;
      },

      removeAccount: (id) => {
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
      },

      setBudget: (month, categoryId, amount) => {
        set((s) => {
          if (amount <= 0) {
            return {
              budgets: s.budgets.filter((b) => !(b.month === month && b.categoryId === categoryId)),
            };
          }
          const idx = s.budgets.findIndex(
            (b) => b.month === month && b.categoryId === categoryId
          );
          if (idx >= 0) {
            const next = [...s.budgets];
            next[idx] = { month, categoryId, amount };
            return { budgets: next };
          }
          return { budgets: [...s.budgets, { month, categoryId, amount }] };
        });
      },

      getBudget: (month, categoryId) =>
        get().budgets.find((b) => b.month === month && b.categoryId === categoryId)?.amount ?? 0,

      materializeRecurring: (asOfYmd) => {
        const asOf = asOfYmd ?? todayYmd();
        const { recurrenceRules, transactions } = get();
        const newTxs: Transaction[] = [];
        const updatedRules: RecurrenceRule[] = [];
        let anyChanges = false;

        for (const rule of recurrenceRules) {
          const dates = pendingOccurrences(rule, asOf);
          if (dates.length === 0) {
            updatedRules.push(rule);
            continue;
          }
          anyChanges = true;
          for (const date of dates) {
            newTxs.push({
              id: uid("tx"),
              date,
              kind: rule.kind,
              amount: rule.amount,
              categoryId: rule.categoryId,
              accountId: rule.accountId,
              note: rule.note,
              description: rule.description,
              recurrenceId: rule.id,
            });
          }
          updatedRules.push({
            ...rule,
            lastMaterializedThrough: dates[dates.length - 1],
          });
        }

        if (!anyChanges) return;
        set({
          transactions: [...transactions, ...newTxs],
          recurrenceRules: updatedRules,
        });
      },

      resetAll: () =>
        set({
          accounts: DEFAULT_ACCOUNTS,
          categories: DEFAULT_CATEGORIES,
          transactions: [],
          recurrenceRules: [],
          budgets: [],
        }),
    }),
    { name: "fire-money", version: 1 }
  )
);
