import { TransactionsTable } from "@/components/finance/transactions-table";
import { listTransactions } from "@/lib/data/finance";
import type { FlowType, ProfileType, SourceType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const transactions = await listTransactions({
    profile: parseProfile(params.profile),
    flow: parseFlow(params.flow),
    source: parseSource(params.source),
    query: params.q,
    from: params.from,
    to: params.to,
  });

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">Movimentacoes</span>
        <h1>Todos os lancamentos.</h1>
        <p>Filtre por perfil, periodo, fluxo, origem ou texto da descricao.</p>
      </header>

      <form className="filters">
        <input name="q" placeholder="Buscar descricao" defaultValue={params.q ?? ""} />
        <select name="profile" defaultValue={params.profile ?? ""}>
          <option value="">Todos os perfis</option>
          <option value="personal">Pessoal</option>
          <option value="business">Empresarial</option>
        </select>
        <select name="flow" defaultValue={params.flow ?? ""}>
          <option value="">Todos os fluxos</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
          <option value="investment">Investimento</option>
        </select>
        <select name="source" defaultValue={params.source ?? ""}>
          <option value="">Todas as origens</option>
          <option value="banco_mcp">Banco MCP</option>
          <option value="csv">CSV</option>
          <option value="manual">Manual</option>
        </select>
        <input type="date" name="from" defaultValue={params.from ?? ""} />
        <input type="date" name="to" defaultValue={params.to ?? ""} />
        <button type="submit">Filtrar</button>
      </form>

      <section className="panel">
        <TransactionsTable transactions={transactions} />
      </section>
    </>
  );
}

function parseProfile(value?: string): ProfileType | undefined {
  return value === "personal" || value === "business" ? value : undefined;
}

function parseFlow(value?: string): FlowType | undefined {
  return value === "income" || value === "expense" || value === "investment" ? value : undefined;
}

function parseSource(value?: string): SourceType | undefined {
  return value === "csv" || value === "banco_mcp" || value === "manual" ? value : undefined;
}
