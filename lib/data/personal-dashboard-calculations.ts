import type { FlowType } from "@/lib/types";

export type PersonalDashboardPeriod = "30d" | "90d" | "ytd" | "all";

export type BalancePoint = {
  date: string;
  balance: number;
};

export type BalanceTransaction = {
  date: string;
  amount: number;
  flow: FlowType;
};

export type BuildDailyBalanceSeriesArgs = {
  currentBalance: number;
  startDate: string;
  endDate: string;
  transactions: BalanceTransaction[];
};

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnly(date);
}

export function parsePersonalDashboardPeriod(value?: string): PersonalDashboardPeriod {
  if (value === "30d" || value === "90d" || value === "ytd" || value === "all") return value;
  return "90d";
}

export function periodStartDate(period: PersonalDashboardPeriod, now = new Date(), firstTransactionDate?: string | null) {
  if (period === "all") return firstTransactionDate ?? dateOnly(now);
  if (period === "ytd") return `${now.getUTCFullYear()}-01-01`;

  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  date.setUTCDate(date.getUTCDate() - (period === "30d" ? 29 : 89));
  return dateOnly(date);
}

function flowSignal(flow: FlowType) {
  if (flow === "income") return 1;
  return -1;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildDailyBalanceSeries({
  currentBalance,
  startDate,
  endDate,
  transactions,
}: BuildDailyBalanceSeriesArgs): BalancePoint[] {
  const dailyNet = new Map<string, number>();
  for (const transaction of transactions) {
    const current = dailyNet.get(transaction.date) ?? 0;
    dailyNet.set(transaction.date, current + Number(transaction.amount) * flowSignal(transaction.flow));
  }

  const reversed: BalancePoint[] = [];
  let cursor = endDate;
  let balance = currentBalance;

  while (cursor >= startDate) {
    reversed.push({ date: cursor, balance: roundMoney(balance) });
    balance -= dailyNet.get(cursor) ?? 0;
    cursor = addDays(cursor, -1);
  }

  return reversed.reverse();
}
