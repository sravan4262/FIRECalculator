import type { Transaction, MoneyCategory, MoneyAccount } from "./types";

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(
  txs: Transaction[],
  categories: MoneyCategory[],
  accounts: MoneyAccount[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c.label]));
  const acctMap = new Map(accounts.map((a) => [a.id, a.name]));
  const rows: string[][] = [
    ["Date", "Kind", "Amount", "Category", "Account", "Note", "Description"],
  ];
  for (const t of [...txs].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([
      t.date,
      t.kind,
      String(t.amount),
      catMap.get(t.categoryId) ?? "",
      acctMap.get(t.accountId) ?? "",
      t.note ?? "",
      t.description ?? "",
    ]);
  }
  return rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
