import { TransactionTable } from "@/components/transactions/table";
import { brl } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createAdminClient();
  const start = new Date(); start.setDate(1);
  const [{ data, error }, { count: reviewCount }] = await Promise.all([
    supabase.from("transactions").select("*").gte("date", start.toISOString().slice(0, 10)).order("date", { ascending: false }),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("needs_review", true),
  ]);
  if (error) return <><h1>FinanceHub</h1><p className="lead">Sua visão financeira consolidada.</p><div className="error">Não foi possível consultar o Supabase: {error.message}</div></>;
  const transactions = (data ?? []) as Transaction[];
  const income = transactions.filter(t => t.flow === "receita").reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter(t => t.flow === "despesa").reduce((sum, t) => sum + Number(t.amount), 0);
  return <>
    <h1>Olá, Kelvenyn.</h1><p className="lead">Este é o retrato das suas finanças no mês atual.</p>
    <div className="grid"><div className="card"><div className="label">Resultado do mês</div><div className={`value ${income-expense >= 0 ? "positive" : "negative"}`}>{brl.format(income-expense)}</div></div>
      <div className="card"><div className="label">Receitas</div><div className="value positive">{brl.format(income)}</div></div>
      <div className="card"><div className="label">Despesas</div><div className="value negative">{brl.format(expense)}</div></div></div>
    <section className="section"><div className="section-head"><h2>Movimentações recentes</h2><span className="badge">{reviewCount ?? 0} para revisar</span></div><TransactionTable transactions={transactions.slice(0, 12)} /></section>
  </>;
}

