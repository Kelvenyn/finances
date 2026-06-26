import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, DashboardSummary, FlowType, ProfileType, SourceType, Transaction } from "@/lib/types";

export interface TransactionFilters {
  profile?: ProfileType;
  flow?: FlowType;
  source?: SourceType;
  query?: string;
  from?: string;
  to?: string;
  needsReview?: boolean;
}

function monthStart() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

export async function getDashboardSummary(profile: ProfileType): Promise<DashboardSummary> {
  const supabase = await createServerSupabaseClient();
  const from = monthStart();

  const [{ data: transactions }, { count: reviewCount }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, accounts(name,institution,type), categories(name,color)")
      .eq("profile", profile)
      .gte("date", from)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("profile", profile)
      .eq("needs_review", true),
  ]);

  const rows = ((transactions ?? []) as unknown[]) as Transaction[];
  const income = sumFlow(rows, "income");
  const expense = sumFlow(rows, "expense");
  const investment = sumFlow(rows, "investment");

  const categoryMap = new Map<string, { name: string; color: string; amount: number }>();
  for (const transaction of rows) {
    if (transaction.flow !== "expense") continue;
    const name = transaction.categories?.name ?? "Sem categoria";
    const color = transaction.categories?.color ?? "#64748b";
    const current = categoryMap.get(name) ?? { name, color, amount: 0 };
    current.amount += Number(transaction.amount);
    categoryMap.set(name, current);
  }

  return {
    income,
    expense,
    investment,
    net: income - expense - investment,
    reviewCount: reviewCount ?? 0,
    transactionCount: rows.length,
    recentTransactions: rows.slice(0, 10),
    byCategory: [...categoryMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 6),
  };
}

export async function listTransactions(filters: TransactionFilters = {}) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("transactions")
    .select("*, accounts(name,institution,type), categories(name,color)")
    .order("date", { ascending: false })
    .limit(250);

  if (filters.profile) query = query.eq("profile", filters.profile);
  if (filters.flow) query = query.eq("flow", filters.flow);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.needsReview) query = query.eq("needs_review", true);
  if (filters.query) query = query.ilike("description", `%${filters.query}%`);

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown[]) as Transaction[];
}

export async function listCategories(profile?: ProfileType) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("categories").select("*").order("profile").order("name");
  if (profile) query = query.eq("profile", profile);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown[]) as Category[];
}

export async function listAccounts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("accounts").select("*").order("profile").order("institution");
  if (error) throw error;
  return data ?? [];
}

function sumFlow(rows: Transaction[], flow: FlowType) {
  return rows.filter((row) => row.flow === flow).reduce((sum, row) => sum + Number(row.amount), 0);
}
