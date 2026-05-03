"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Repeat, Trash2 } from "lucide-react";
import { useMoneyStore } from "@/lib/money/store";
import { todayYmd, describeRecurrence } from "@/lib/money/recurrence";
import type { TxKind, RecurrenceFrequency, Transaction, RecurrenceRule } from "@/lib/money/types";

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  defaultMonth: string;
}

function defaultDateForMonth(month: string): string {
  const today = todayYmd();
  if (today.startsWith(month)) return today;
  return `${month}-01`;
}

export function AddTransactionSheet({ open, onClose, editId, defaultMonth }: Props) {
  const transactions = useMoneyStore((s) => s.transactions);
  const recurrenceRules = useMoneyStore((s) => s.recurrenceRules);

  const editingTx = useMemo(
    () => (editId ? transactions.find((t) => t.id === editId) : null),
    [editId, transactions]
  );
  const linkedRule = useMemo(
    () =>
      editingTx?.recurrenceId
        ? recurrenceRules.find((r) => r.id === editingTx.recurrenceId)
        : null,
    [editingTx, recurrenceRules]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(540px,calc(100vw-2rem))] max-h-[calc(100vh-3rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-2xl"
          >
            <TxForm
              key={editingTx?.id ?? "new"}
              editingTx={editingTx ?? null}
              linkedRule={linkedRule ?? null}
              defaultMonth={defaultMonth}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FormProps {
  editingTx: Transaction | null;
  linkedRule: RecurrenceRule | null;
  defaultMonth: string;
  onClose: () => void;
}

function TxForm({ editingTx, linkedRule, defaultMonth, onClose }: FormProps) {
  const accounts = useMoneyStore((s) => s.accounts);
  const categories = useMoneyStore((s) => s.categories);
  const addTransaction = useMoneyStore((s) => s.addTransaction);
  const updateTransaction = useMoneyStore((s) => s.updateTransaction);
  const deleteTransaction = useMoneyStore((s) => s.deleteTransaction);
  const addRecurrenceRule = useMoneyStore((s) => s.addRecurrenceRule);
  const deleteRecurrenceRule = useMoneyStore((s) => s.deleteRecurrenceRule);

  const [kind, setKind] = useState<TxKind>(editingTx?.kind ?? "expense");
  const [date, setDate] = useState(editingTx?.date ?? defaultDateForMonth(defaultMonth));
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : "");
  const [categoryId, setCategoryId] = useState(editingTx?.categoryId ?? "");
  const [accountId, setAccountId] = useState(editingTx?.accountId ?? accounts[0]?.id ?? "");
  const [note, setNote] = useState(editingTx?.note ?? "");
  const [description, setDescription] = useState(editingTx?.description ?? "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("monthly");
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState("");

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.kind === kind),
    [categories, kind]
  );

  const effectiveCategoryId = useMemo(() => {
    if (visibleCategories.some((c) => c.id === categoryId)) return categoryId;
    return visibleCategories[0]?.id ?? "";
  }, [visibleCategories, categoryId]);

  const canSave =
    !!amount && parseFloat(amount) > 0 && !!effectiveCategoryId && !!accountId && !!date;

  const handleSave = () => {
    if (!canSave) return;
    const amt = parseFloat(amount);
    const payload = {
      date,
      kind,
      amount: amt,
      categoryId: effectiveCategoryId,
      accountId,
      note: note.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (editingTx) {
      updateTransaction(editingTx.id, payload);
    } else if (isRecurring) {
      addRecurrenceRule({
        ...payload,
        startDate: date,
        frequency,
        interval: Math.max(1, interval),
        endDate: endDate || undefined,
      });
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editingTx) return;
    if (linkedRule) {
      const stopRule = window.confirm(
        "This transaction was created by a recurring rule. Delete the rule too (stop future occurrences)? Click Cancel to delete only this one."
      );
      if (stopRule) deleteRecurrenceRule(linkedRule.id, false);
    }
    deleteTransaction(editingTx.id);
    onClose();
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/30 px-5 py-3 flex items-center justify-between z-10">
        <h3 className="text-sm font-semibold">
          {editingTx ? "Edit transaction" : "New transaction"}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Kind toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/30 border border-border/30">
          {(["income", "expense"] as TxKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              disabled={!!editingTx}
              className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {kind === k && (
                <motion.div
                  layoutId="kind-pill"
                  className={`absolute inset-0 rounded-lg border ${
                    k === "income"
                      ? "bg-success/20 border-success/40"
                      : "bg-destructive/15 border-destructive/40"
                  }`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  kind === k
                    ? k === "income"
                      ? "text-success"
                      : "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {k}
              </span>
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Amount
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl text-muted-foreground">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="flex-1 bg-transparent border-b border-border/40 focus:border-primary/60 outline-none text-2xl font-semibold tabular-nums py-1"
            />
          </div>
        </div>

        {/* Date */}
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <select
            value={effectiveCategoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-card border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          >
            {visibleCategories.length === 0 && <option value="">(no categories)</option>}
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Account */}
        <Field label="Account">
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-card border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Note */}
        <Field label="Note">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Salary, FL Rent, Dunkin"
            className="w-full bg-transparent border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60 resize-none"
          />
        </Field>

        {/* Recurrence */}
        {!editingTx && (
          <div className="rounded-xl border border-border/40 p-3 space-y-3 bg-muted/10">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">Make recurring</span>
              {isRecurring && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {describeRecurrence({
                    frequency,
                    interval: Math.max(1, interval),
                    endDate: endDate || undefined,
                  })}
                </span>
              )}
            </label>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Field label="Frequency">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full bg-card border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </Field>
                <Field label="Every N">
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                  />
                </Field>
                <Field label="End date (optional)" full>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent border border-border/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60"
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {linkedRule && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
            <Repeat className="w-3.5 h-3.5 text-primary" />
            Generated by recurring rule —{" "}
            {describeRecurrence({
              frequency: linkedRule.frequency,
              interval: linkedRule.interval,
              endDate: linkedRule.endDate,
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border/30 px-5 py-3 flex items-center gap-2">
        {editingTx && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="ml-auto px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {editingTx ? "Save" : isRecurring ? "Create rule" : "Add"}
        </button>
      </div>
    </>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
