"use client";
import { useMoneyStore } from "@/lib/money/store";
import { buildCalendarGrid } from "@/lib/money/selectors";
import { todayYmd } from "@/lib/money/recurrence";

interface Props {
  month: string;
  onSelectDay: (ymd: string) => void;
}

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ month, onSelectDay }: Props) {
  const { transactions } = useMoneyStore();
  const cells = buildCalendarGrid(month);
  const today = todayYmd();

  const byDate = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const cur = byDate.get(t.date) ?? { income: 0, expense: 0 };
    cur[t.kind] += t.amount;
    byDate.set(t.date, cur);
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/30">
        {DOW.map((d) => (
          <div
            key={d}
            className={`py-2 ${
              d === "Sat" ? "text-primary" : d === "Sun" ? "text-destructive" : ""
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const totals = byDate.get(cell.ymd);
          const isToday = cell.ymd === today;
          const dayNum = parseInt(cell.ymd.slice(8, 10), 10);

          return (
            <button
              key={cell.ymd}
              onClick={() => onSelectDay(cell.ymd)}
              className={`relative min-h-[68px] sm:min-h-[80px] border-r border-b border-border/15 last-of-type:border-r-0 p-1.5 text-left transition-colors hover:bg-muted/20 ${
                cell.inMonth ? "" : "bg-muted/5 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs tabular-nums ${
                    isToday
                      ? "bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 font-semibold"
                      : cell.dow === 5
                      ? "text-primary"
                      : cell.dow === 6
                      ? "text-destructive"
                      : ""
                  }`}
                >
                  {dayNum}
                </span>
              </div>
              {totals && (
                <div className="mt-1 space-y-0.5 text-[10px] tabular-nums">
                  {totals.income > 0 && (
                    <div className="text-success truncate">+{Math.round(totals.income)}</div>
                  )}
                  {totals.expense > 0 && (
                    <div className="text-destructive truncate">-{Math.round(totals.expense)}</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
