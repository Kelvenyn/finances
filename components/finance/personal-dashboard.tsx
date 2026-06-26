import Link from "next/link";
import { syncPersonalNow } from "@/app/(app)/personal/actions";
import { brl, formatDateTime } from "@/lib/format";
import { getPersonalDashboardData, type PersonalDashboardPeriod } from "@/lib/data/personal-dashboard";
import { BalanceLineChart } from "./balance-line-chart";
import { StatCard } from "./stat-card";
import { SyncNowButton } from "./sync-now-button";
import { TransactionsTable } from "./transactions-table";

const periodOptions: Array<{ value: PersonalDashboardPeriod; label: string }> = [
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "ytd", label: "Ano atual" },
  { value: "all", label: "Todo historico" },
];

export async function PersonalDashboard({ period }: { period: PersonalDashboardPeriod }) {
  const data = await getPersonalDashboardData(period);

  return (
    <>
      <header className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">Pessoal</span>
          <h1>Seu painel financeiro.</h1>
          <p>Atualize os lancamentos, acompanhe saldo, entradas, saidas e o que ainda precisa de revisao.</p>
        </div>
        <SyncNowButton action={syncPersonalNow} />
      </header>

      <section className="stats-grid personal-stats-grid">
        <StatCard label="Saldo atual" value={brl.format(data.currentBalance)} detail="Contas pessoais conectadas" icon="=" />
        <StatCard label="Entradas" value={brl.format(data.monthIncome)} detail="Receitas do mes" tone="positive" icon="+" />
        <StatCard label="Saidas" value={brl.format(data.monthExpense)} detail="Despesas do mes" tone="negative" icon="-" />
        <StatCard
          label="Resultado"
          value={brl.format(data.monthResult)}
          detail="Entradas menos saidas"
          tone={data.monthResult >= 0 ? "positive" : "negative"}
          icon="%"
        />
        <StatCard label="Revisao" value={String(data.reviewCount)} detail="Lancamentos pendentes" icon="!" />
        <StatCard
          label="Atualizacao"
          value={data.lastSyncAt ? formatDateTime(data.lastSyncAt) : "Sem sync"}
          detail={data.lastSyncStatus ? `Ultimo status: ${data.lastSyncStatus}` : "Banco MCP ainda sem historico"}
          icon="R"
        />
      </section>

      <section className="panel chart-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Saldo dia a dia</span>
            <h2>Evolucao do saldo</h2>
          </div>
          <div className="period-tabs" aria-label="Periodo do grafico">
            {periodOptions.map((option) => (
              <Link
                key={option.value}
                href={`/personal?period=${option.value}`}
                className={option.value === period ? "active" : ""}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
        <BalanceLineChart points={data.chart} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recentes</span>
              <h2>Ultimos lancamentos pessoais</h2>
            </div>
            <Link href="/transactions?profile=personal" className="text-link">
              Ver todas
            </Link>
          </div>
          <TransactionsTable transactions={data.recentTransactions} />
        </div>

        <aside className="panel side-panel">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Revisao</span>
              <h2>Pendencias</h2>
            </div>
          </div>
          <div className="review-summary">
            <strong>{data.reviewCount}</strong>
            <p>{data.reviewCount === 1 ? "lancamento pessoal precisa" : "lancamentos pessoais precisam"} de categoria.</p>
            <Link href="/review" className="text-link">
              Revisar agora
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
