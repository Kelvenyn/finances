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
  if (error) return <><PageHeading eyebrow="Visão geral" title="Seu dinheiro, sem ruído." description="Acompanhe o que entrou, saiu e merece sua atenção." /><div className="error">Não foi possível consultar o Supabase: {error.message}</div></>;
  const transactions = (data ?? []) as Transaction[];
  const income = transactions.filter(t => t.flow === "receita").reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter(t => t.flow === "despesa").reduce((sum, t) => sum + Number(t.amount), 0);
  const net = income - expense;
  const expenseRatio = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;
  return <>
    <PageHeading eyebrow="Visão geral" title="Olá, Kelvenyn." description="Este é o retrato das suas finanças no mês atual." />
    <div className="stats-grid">
      <MetricCard label="Resultado do mês" value={brl.format(net)} tone={net >= 0 ? "positive" : "negative"} detail="Receitas menos despesas" featured />
      <MetricCard label="Receitas" value={brl.format(income)} tone="positive" detail={`${transactions.filter(t => t.flow === "receita").length} entradas no período`} />
      <MetricCard label="Despesas" value={brl.format(expense)} tone="negative" detail={`${transactions.filter(t => t.flow === "despesa").length} saídas no período`} />
      <article className="metric-card"><div className="metric-top"><span className="metric-icon neutral">◎</span><span className="metric-label">Uso das receitas</span></div><div className="metric-value">{expenseRatio}%</div><div className="progress-track"><span style={{ width: `${expenseRatio}%` }} /></div><p className="metric-detail">das receitas comprometidas</p></article>
    </div>
    <div className="dashboard-grid">
      <section className="section panel transactions-panel"><div className="section-head"><div><span className="section-kicker">Atividade</span><h2>Movimentações recentes</h2></div><a className="text-link" href="/transactions">Ver todas <span>→</span></a></div><TransactionTable transactions={transactions.slice(0, 12)} /></section>
      <aside className="dashboard-aside">
        <section className="panel attention-card"><div className="section-head"><div><span className="section-kicker">Pendências</span><h2>Para sua atenção</h2></div><span className="attention-count">{reviewCount ?? 0}</span></div><div className="attention-body"><span className="attention-icon">✓</span><div><strong>{reviewCount ?? 0} transações para revisar</strong><p>Categorize os lançamentos para melhorar seus relatórios.</p><a href="/review">Revisar agora →</a></div></div></section>
        <section className="panel source-card"><span className="section-kicker">Cobertura dos dados</span><h2>Histórico consolidado</h2><div className="source-row"><span className="source-line csv" /><div><strong>Planilha categorizada</strong><small>jan/2022 — mai/2026</small></div><b>3.495</b></div><div className="source-row"><span className="source-line bank" /><div><strong>Open Finance</strong><small>dados bancários atuais</small></div><b>4.658</b></div><div className="source-total"><span>Total consolidado</span><strong>8.153 transações</strong></div></section>
      </aside>
    </div>
  </>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="period-control"><span>Período</span><strong>Mês atual⌄</strong></div></header>;
}

function MetricCard({ label, value, detail, tone, featured }: { label: string; value: string; detail: string; tone: "positive" | "negative"; featured?: boolean }) {
  return <article className={`metric-card ${featured ? "featured" : ""}`}><div className="metric-top"><span className={`metric-icon ${tone}`}>{tone === "positive" ? "↙" : "↗"}</span><span className="metric-label">{label}</span></div><div className={`metric-value ${tone}`}>{value}</div><p className="metric-detail">{detail}</p></article>;
}

