import { TransactionsTable } from "@/components/finance/transactions-table";
import { listAccounts, listCategories, listTransactions } from "@/lib/data/finance";
import type { FlowType, SourceType } from "@/lib/types";
import { flowLabel, profileLabel } from "@/lib/format";
import { parseProfile } from "@/lib/ui/preferences";

export const dynamic = "force-dynamic";

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const profile = parseProfile(params.profile);
  const needsReview = params.status === "review";
  const [transactions, accounts, categories] = await Promise.all([
    listTransactions({
      profile,
      flow: parseFlow(params.flow),
      source: parseSource(params.source),
      accountId: params.accountId,
      categoryId: params.categoryId,
      query: params.q,
      from: params.from,
      to: params.to,
      needsReview,
    }),
    listAccounts(),
    listCategories(profile),
  ]);
  const filteredAccounts = accounts.filter((account) => account.profile === profile);

  return (
    <>
      <header className="page-heading premium-page-heading">
        <span className="eyebrow">{profileLabel(profile)}</span>
        <h1>Lancamentos</h1>
        <p>
          Busque, filtre e revise as movimentacoes do perfil ativo sem misturar
          pessoal e empresarial.
        </p>
      </header>

      <form className="filters premium-filters">
        <input type="hidden" name="profile" value={profile} />
        <input name="q" placeholder="Buscar descricao" defaultValue={params.q ?? ""} />
        <select name="status" defaultValue={params.status ?? ""}>
          <option value="">Todos os status</option>
          <option value="review">Pendentes de revisao</option>
        </select>
        <select name="flow" defaultValue={params.flow ?? ""}>
          <option value="">Todos os fluxos</option>
          <option value="income">{flowLabel("income")}</option>
          <option value="expense">{flowLabel("expense")}</option>
          <option value="investment">{flowLabel("investment")}</option>
        </select>
        <select name="source" defaultValue={params.source ?? ""}>
          <option value="">Todas as origens</option>
          <option value="banco_mcp">Banco MCP</option>
          <option value="csv">CSV</option>
          <option value="manual">Manual</option>
        </select>
        <select name="accountId" defaultValue={params.accountId ?? ""}>
          <option value="">Todas as contas</option>
          {filteredAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={params.categoryId ?? ""}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input type="date" name="from" defaultValue={params.from ?? ""} />
        <input type="date" name="to" defaultValue={params.to ?? ""} />
        <button type="submit">Filtrar</button>
      </form>

      <section className="panel premium-panel">
        <TransactionsTable transactions={transactions} />
      </section>
    </>
  );
}

function parseFlow(value?: string): FlowType | undefined {
  return value === "income" || value === "expense" || value === "investment"
    ? value
    : undefined;
}

function parseSource(value?: string): SourceType | undefined {
  return value === "csv" || value === "banco_mcp" || value === "manual"
    ? value
    : undefined;
}
