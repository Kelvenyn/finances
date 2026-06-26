import Link from "next/link";
import { brl, profileLabel } from "@/lib/format";
import { getDashboardSummary } from "@/lib/data/finance";
import type { ProfileType } from "@/lib/types";
import { StatCard } from "./stat-card";
import { TransactionsTable } from "./transactions-table";

export async function ProfileDashboard({ profile }: { profile: ProfileType }) {
  const summary = await getDashboardSummary(profile);
  const maxCategory = Math.max(...summary.byCategory.map((item) => item.amount), 1);

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">{profileLabel(profile)}</span>
        <h1>{profile === "personal" ? "Seu dinheiro pessoal." : "Caixa da empresa."}</h1>
        <p>
          Entradas, saidas e saldo do mes atual sem misturar com{" "}
          {profile === "personal" ? "a empresa" : "a vida pessoal"}.
        </p>
      </header>

      <section className="stats-grid">
        <StatCard label="Receitas" value={brl.format(summary.income)} detail="Entradas do mes" tone="positive" icon="+" />
        <StatCard label="Despesas" value={brl.format(summary.expense)} detail="Saidas do mes" tone="negative" icon="-" />
        <StatCard label="Investimentos" value={brl.format(summary.investment)} detail="Aplicacoes e reservas" icon="%" />
        <StatCard
          label="Saldo pratico"
          value={brl.format(summary.net)}
          detail={`${summary.reviewCount} lancamentos para revisar`}
          tone={summary.net >= 0 ? "positive" : "negative"}
          icon="="
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recentes</span>
              <h2>Movimentacoes do mes</h2>
            </div>
            <Link href={`/lancamentos?profile=${profile}`} className="text-link">
              Ver todas
            </Link>
          </div>
          <TransactionsTable transactions={summary.recentTransactions} />
        </div>

        <aside className="panel side-panel">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Categorias</span>
              <h2>Maiores gastos</h2>
            </div>
          </div>
          <div className="category-list">
            {summary.byCategory.length ? (
              summary.byCategory.map((item) => (
                <div key={item.name} className="category-row">
                  <div>
                    <span style={{ backgroundColor: item.color }} />
                    <strong>{item.name}</strong>
                  </div>
                  <small>{brl.format(item.amount)}</small>
                  <i style={{ width: `${Math.max(8, (item.amount / maxCategory) * 100)}%`, backgroundColor: item.color }} />
                </div>
              ))
            ) : (
              <p className="muted">Sem despesas categorizadas neste periodo.</p>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
