"use client";
import { useMoneyStore } from "@/lib/money/store";
import {
  txInRange,
  txInMonth,
  totalsByKind,
  buildWeeklyBreakdown,
  monthsInYear,
  shortMonthLabel,
  monthRange,
} from "@/lib/money/selectors";
import { formatCurrency } from "@/lib/utils";
import { todayYmd } from "@/lib/money/recurrence";
import { motion } from "framer-motion";

interface Props {
  month: string;
  onSelectMonth: (m: string) => void;
}

export function MonthlyView({ month, onSelectMonth }: Props) {
  const { transactions } = useMoneyStore();
  const year = parseInt(month.slice(0, 4), 10);
  const months = monthsInYear(year);
  const today = todayYmd();
  const todayMonth = today.slice(0, 7);

  const yearTotals = months.reduce(
    (acc, m) => {
      const t = totalsByKind(txInMonth(transactions, m));
      acc.income += t.income;
      acc.expense += t.expense;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const weeks = buildWeeklyBreakdown(month);

  return (
    <div className="space-y-4">
      {/* Year header */}
      <div className="glass rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{year}</span>
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="text-success">{formatCurrency(yearTotals.income)}</span>
            <span className="text-destructive">{formatCurrency(yearTotals.expense)}</span>
            <span
              className={
                yearTotals.income - yearTotals.expense >= 0
                  ? "text-foreground"
                  : "text-destructive"
              }
            >
              {formatCurrency(yearTotals.income - yearTotals.expense)}
            </span>
          </div>
        </div>
      </div>

      {/* Months list */}
      <div className="glass rounded-2xl overflow-hidden">
        {months
          .slice()
          .reverse()
          .map((m) => {
            const t = totalsByKind(txInMonth(transactions, m));
            const isCurrent = m === month;
            const isFuture = m > todayMonth;
            return (
              <button
                key={m}
                onClick={() => onSelectMonth(m)}
                className={`w-full grid grid-cols-[80px_1fr] items-center px-4 py-3 border-b border-border/20 last:border-0 hover:bg-muted/15 transition-colors text-left ${
                  isCurrent ? "bg-primary/8" : ""
                } ${isFuture ? "opacity-40" : ""}`}
              >
                <div>
                  <div className="text-sm font-semibold">{shortMonthLabel(m)}</div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">
                    {monthRange(m).from.slice(5).replace("-", "/")} ~{" "}
                    {monthRange(m).to.slice(5).replace("-", "/")}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 text-xs tabular-nums">
                  <span className="text-success">{formatCurrency(t.income)}</span>
                  <span className="text-destructive">{formatCurrency(t.expense)}</span>
                  <span
                    className={
                      t.income - t.expense >= 0 ? "text-muted-foreground" : "text-destructive"
                    }
                  >
                    {formatCurrency(t.income - t.expense)}
                  </span>
                </div>
              </button>
            );
          })}
      </div>

      {/* Weekly breakdown of current month */}
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Weeks in {shortMonthLabel(month)}
        </div>
        <div className="glass rounded-2xl overflow-hidden">
          {weeks.map((w, i) => {
            const t = totalsByKind(txInRange(transactions, w.from, w.to));
            const isCurrentWeek = today >= w.from && today <= w.to;
            return (
              <motion.div
                key={w.from}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`grid grid-cols-[110px_1fr] items-center px-4 py-2.5 border-b border-border/20 last:border-0 ${
                  isCurrentWeek ? "bg-destructive/8" : ""
                }`}
              >
                <div className="text-xs tabular-nums text-muted-foreground">{w.label}</div>
                <div className="flex items-center justify-end gap-3 text-xs tabular-nums">
                  <span className={t.income > 0 ? "text-success" : "text-muted-foreground/50"}>
                    {formatCurrency(t.income)}
                  </span>
                  <span className={t.expense > 0 ? "text-destructive" : "text-muted-foreground/50"}>
                    {formatCurrency(t.expense)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
