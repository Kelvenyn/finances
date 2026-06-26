import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FlowType, Transaction } from "@/lib/types";
import {
  buildDailyBalanceSeries,
  periodStartDate,
  type BalancePoint,
  type BalanceTransaction,
  type PersonalDashboardPeriod,
} from "./personal-dashboard-calculations";

export {
  buildDailyBalanceSeries,
  parsePersonalDashboardPeriod,
  periodStartDate,
  type BalancePoint,
  type BalanceTransaction,
  type PersonalDashboardPeriod,
} from "./personal-dashboard-calculations";

export type PersonalAccountBalance = {
  id: string;
  name: string;
  institution: string;
  type: string;
  current_balance: number | null;
};

export type PersonalDashboardData = {
  period: PersonalDashboardPeriod;
  currentBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthInvestment: number;
  monthResult: number;
  reviewCount: number;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  chart: BalancePoint[];
  recentTransactions: Transaction[];
  accounts: PersonalAccountBalance[];
};

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart() {
  const date = new Date();
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function sumFlow(rows: Array<{ flow: FlowType; amount: number | string }>, flow: FlowType) {
  return rows.filter((row) => row.flow === flow).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function getPersonalDashboardData(period: PersonalDashboardPeriod): Promise<PersonalDashboardData> {
  const supabase = await createServerSupabaseClient();
  const today = todayUtc();
  const firstTransactionQuery = await supabase
    .from("transactions")
    .select("date")
    .eq("profile", "personal")
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (firstTransactionQuery.error) throw firstTransactionQuery.error;

  const startDate = periodStartDate(period, new Date(), firstTransactionQuery.data?.date ?? null);
  const month = monthStart();

  const [accountsResult, chartTransactionsResult, monthTransactionsResult, reviewResult, recentResult, syncResult] =
    await Promise.all([
      supabase
        .from("accounts")
        .select("id, name, institution, type, current_balance")
        .eq("profile", "personal")
        .neq("type", "credit")
        .order("institution"),
      supabase
        .from("transactions")
        .select("date, amount, flow")
        .eq("profile", "personal")
        .gte("date", startDate)
        .lte("date", today),
      supabase
        .from("transactions")
        .select("amount, flow")
        .eq("profile", "personal")
        .gte("date", month)
        .lte("date", today),
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("profile", "personal")
        .eq("needs_review", true),
      supabase
        .from("transactions")
        .select("*, accounts(name,institution,type), categories(name,color)")
        .eq("profile", "personal")
        .order("date", { ascending: false })
        .limit(10),
      supabase
        .from("sync_runs")
        .select("status, finished_at, started_at")
        .eq("source", "banco_mcp")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (accountsResult.error) throw accountsResult.error;
  if (chartTransactionsResult.error) throw chartTransactionsResult.error;
  if (monthTransactionsResult.error) throw monthTransactionsResult.error;
  if (reviewResult.error) throw reviewResult.error;
  if (recentResult.error) throw recentResult.error;
  if (syncResult.error) throw syncResult.error;

  const accounts = (accountsResult.data ?? []) as PersonalAccountBalance[];
  const currentBalance = accounts.reduce((sum, account) => sum + Number(account.current_balance ?? 0), 0);
  const monthRows = ((monthTransactionsResult.data ?? []) as unknown[]) as Array<{ flow: FlowType; amount: number | string }>;
  const monthIncome = sumFlow(monthRows, "income");
  const monthExpense = sumFlow(monthRows, "expense");
  const monthInvestment = sumFlow(monthRows, "investment");
  const chartRows = ((chartTransactionsResult.data ?? []) as unknown[]) as BalanceTransaction[];

  return {
    period,
    currentBalance,
    monthIncome,
    monthExpense,
    monthInvestment,
    monthResult: monthIncome - monthExpense - monthInvestment,
    reviewCount: reviewResult.count ?? 0,
    lastSyncAt: syncResult.data?.finished_at ?? syncResult.data?.started_at ?? null,
    lastSyncStatus: syncResult.data?.status ?? null,
    chart: buildDailyBalanceSeries({ currentBalance, startDate, endDate: today, transactions: chartRows }),
    recentTransactions: ((recentResult.data ?? []) as unknown[]) as Transaction[],
    accounts,
  };
}
