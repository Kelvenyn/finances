import { listAccounts, listCategories } from "@/lib/data/finance";
import { brl, flowLabel, profileLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [accounts, categories] = await Promise.all([listAccounts(), listCategories()]);

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">Ajustes</span>
        <h1>Contas, categorias e integracoes.</h1>
        <p>Uma visao operacional do que alimenta o Finance Core.</p>
      </header>

      <section className="settings-grid">
        <div className="panel settings-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Contas</span>
              <h2>Instituicoes conectadas</h2>
            </div>
          </div>
          <div className="simple-list">
            {accounts.length ? (
              accounts.map((account) => (
                <div key={account.id}>
                  <strong>{account.name}</strong>
                  <span>
                    {profileLabel(account.profile)} - {account.institution} - {account.status}
                  </span>
                  <small>{account.current_balance === null ? "Saldo nao informado" : brl.format(Number(account.current_balance))}</small>
                </div>
              ))
            ) : (
              <p className="muted">Nenhuma conta cadastrada ainda.</p>
            )}
          </div>
        </div>

        <div className="panel settings-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Categorias</span>
              <h2>Base de classificacao</h2>
            </div>
          </div>
          <div className="category-cloud">
            {categories.map((category) => (
              <span key={category.id} style={{ borderColor: category.color }}>
                {profileLabel(category.profile)} - {flowLabel(category.flow)} - {category.name}
              </span>
            ))}
          </div>
        </div>

        <div className="panel settings-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Integracoes</span>
              <h2>Fontes da v1</h2>
            </div>
          </div>
          <div className="integration-list">
            <article>
              <strong>Banco MCP</strong>
              <p>Sincroniza Open Finance usando `BANCO_MCP_API_KEY` e registra execucoes em `sync_runs`.</p>
            </article>
            <article>
              <strong>CSV historico</strong>
              <p>Importa a planilha antiga pelo comando de CSV e registra lotes em `import_batches`.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
