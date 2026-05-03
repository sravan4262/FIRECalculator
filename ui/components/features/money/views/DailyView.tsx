"use client";
import { motion } from "framer-motion";
import { useMoneyStore } from "@/lib/money/store";
import { txInMonth, groupByDate, totalsByKind, formatYmdLong } from "@/lib/money/selectors";
import { formatCurrency } from "@/lib/utils";
import { Repeat } from "lucide-react";

interface Props {
  month: string;
  onEdit: (id: string) => void;
}

export function DailyView({ month, onEdit }: Props) {
  const { transactions, categories, accounts } = useMoneyStore();
  const groups = groupByDate(txInMonth(transactions, month));

  if (groups.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
        No transactions yet this month. Tap the <span className="text-primary">+</span> button to add one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(({ date, items }) => {
        const t = totalsByKind(items);
        const { day, weekday } = formatYmdLong(date);
        const isWeekend = weekday === "Sat" || weekday === "Sun";
        return (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Day header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/10">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-semibold tabular-nums">{day}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    weekday === "Sun"
                      ? "bg-destructive/15 text-destructive"
                      : isWeekend
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {weekday}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs tabular-nums">
                {t.income > 0 && <span className="text-success">{formatCurrency(t.income)}</span>}
                {t.expense > 0 && <span className="text-destructive">{formatCurrency(t.expense)}</span>}
              </div>
            </div>

            {/* Items */}
            <div>
              {items.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const acct = accounts.find((a) => a.id === tx.accountId);
                return (
                  <button
                    key={tx.id}
                    onClick={() => onEdit(tx.id)}
                    className="w-full grid grid-cols-[80px_1fr_auto] items-center gap-3 px-4 py-2.5 border-b border-border/20 last:border-0 hover:bg-muted/15 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: cat?.color ?? "oklch(0.6 0 0)" }}
                      />
                      <span className="text-[11px] text-muted-foreground truncate">
                        {cat?.label ?? "Unknown"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm truncate flex items-center gap-1.5">
                        {tx.note || cat?.label || "—"}
                        {tx.recurrenceId && (
                          <Repeat className="w-3 h-3 text-primary/70 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{acct?.name}</div>
                    </div>
                    <div
                      className={`text-sm font-medium tabular-nums ${
                        tx.kind === "income" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {tx.kind === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
