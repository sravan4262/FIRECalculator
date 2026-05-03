"use client";
import { useState } from "react";
import { ArrowDownAZ, ArrowDown01, ArrowDown10 } from "lucide-react";
import { useMoneyStore } from "@/lib/money/store";
import { txInMonth, noteCounts } from "@/lib/money/selectors";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  month: string;
}

type Sort = "count-desc" | "amount-desc" | "name-asc";

export function NotesView({ month }: Props) {
  const { transactions } = useMoneyStore();
  const [sort, setSort] = useState<Sort>("count-desc");
  const expenses = txInMonth(transactions, month).filter((t) => t.kind === "expense");
  const notes = noteCounts(expenses);

  const sorted = [...notes].sort((a, b) => {
    if (sort === "count-desc") return b.count - a.count || b.amount - a.amount;
    if (sort === "amount-desc") return b.amount - a.amount;
    return a.note.localeCompare(b.note);
  });

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
        No notes yet. Add transactions with notes (e.g. &quot;Salary&quot;, &quot;Rent&quot;) to see groupings here.
      </div>
    );
  }

  const sortIcon =
    sort === "count-desc" ? (
      <ArrowDown10 className="w-3.5 h-3.5 text-primary" />
    ) : sort === "amount-desc" ? (
      <ArrowDown01 className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDownAZ className="w-3.5 h-3.5 text-primary" />
    );

  const cycleSort = () => {
    setSort((s) =>
      s === "count-desc" ? "amount-desc" : s === "amount-desc" ? "name-asc" : "count-desc"
    );
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[1fr_60px_120px] items-center px-4 py-2.5 border-b border-border/30 text-[11px] text-muted-foreground uppercase tracking-wider">
        <span>Note</span>
        <button onClick={cycleSort} className="flex justify-center" aria-label="Toggle sort">
          {sortIcon}
        </button>
        <span className="text-right">Amount</span>
      </div>
      {sorted.map((n, i) => (
        <motion.div
          key={n.note}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02 }}
          className="grid grid-cols-[1fr_60px_120px] items-center px-4 py-2.5 border-b border-border/20 last:border-0"
        >
          <span className="text-sm truncate">{n.note}</span>
          <span className="text-center text-xs text-muted-foreground tabular-nums">{n.count}</span>
          <span className="text-right text-sm tabular-nums">{formatCurrency(n.amount)}</span>
        </motion.div>
      ))}
    </div>
  );
}
