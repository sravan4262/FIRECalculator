"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useMoneyStore } from "@/lib/money/store";
import { txInMonth, expenseByCategory, totalsByKind } from "@/lib/money/selectors";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  month: string;
}

export function StatsView({ month }: Props) {
  const { transactions, categories } = useMoneyStore();
  const monthTxs = txInMonth(transactions, month);
  const totals = totalsByKind(monthTxs);
  const breakdown = expenseByCategory(monthTxs, categories);

  if (totals.expense === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
        No expenses this month yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="text-center mb-2">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Total expense
          </div>
          <div className="text-2xl font-semibold tabular-nums text-destructive">
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown.map((b) => ({ name: b.category.label, value: b.amount }))}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={1}
                stroke="oklch(0.11 0.025 265)"
                strokeWidth={2}
              >
                {breakdown.map((b) => (
                  <Cell key={b.category.id} fill={b.category.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {breakdown.map((b, i) => {
          const pct = (b.amount / totals.expense) * 100;
          return (
            <motion.div
              key={b.category.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0"
            >
              <div
                className="text-[11px] font-semibold tabular-nums text-center px-1.5 py-0.5 rounded"
                style={{
                  background: `color-mix(in oklch, ${b.category.color} 25%, transparent)`,
                  color: b.category.color,
                }}
              >
                {pct.toFixed(0)}%
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: b.category.color }}
                />
                <span className="text-sm truncate">{b.category.label}</span>
              </div>
              <div className="text-sm font-medium tabular-nums">
                {formatCurrency(b.amount)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
