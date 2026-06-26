import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { listAccounts, listCategories } from "@/lib/data/finance";
import { brl, flowLabel, profileLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [accounts, categories] = await Promise.all([listAccounts(), listCategories()]);

  return (
    <>
      <header className="page-heading premium-page-heading">
        <span className="eyebrow">Configuracoes</span>
        <h1>Preferencias e operacao</h1>
        <p>
          Ajuste a experiencia visual, acompanhe contas conectadas e revise a
          base de categorias.
        </p>
      </header>

      <section className="settings-tabs" aria-label="Areas de configuracao">
        <a href="#aparencia" className="active">Aparencia</a>
        <a href="#contas">Contas</a>
        <a href="#categorias">Categorias</a>
        <a href="#integracoes">Integracoes</a>
        <a href="#seguranca">Seguranca</a>
      </section>

      <section id="aparencia" className="premium-panel settings-panel">
        <AppearanceSettings />
      </section>

      <section id="contas" className="premium-panel settings-panel">
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
                <small>
                  {account.current_balance === null
                    ? "Saldo nao informado"
                    : brl.format(Number(account.current_balance))}
                </small>
              </div>
            ))
          ) : (
            <p className="muted">Nenhuma conta cadastrada ainda.</p>
          )}
        </div>
      </section>

      <section id="categorias" className="premium-panel settings-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Categorias</span>
            <h2>Classificacao</h2>
          </div>
        </div>
        <div className="category-cloud">
          {categories.map((category) => (
            <span key={category.id} style={{ borderColor: category.color }}>
              {profileLabel(category.profile)} - {flowLabel(category.flow)} - {category.name}
            </span>
          ))}
        </div>
      </section>

      <section id="integracoes" className="premium-panel settings-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Integracoes</span>
            <h2>Fontes da v1</h2>
          </div>
        </div>
        <div className="integration-list">
          <article>
            <strong>Banco MCP</strong>
            <p>Sincroniza dados atuais de Open Finance e grava no Supabase.</p>
          </article>
          <article>
            <strong>CSV historico</strong>
            <p>Guarda o historico antigo importado da sua planilha pessoal.</p>
          </article>
        </div>
      </section>

      <section id="seguranca" className="premium-panel settings-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Seguranca</span>
            <h2>Acesso</h2>
          </div>
        </div>
        <p className="muted">
          A v1 usa login por e-mail e senha via Supabase Auth. Tokens e chaves
          ficam nas variaveis de ambiente, fora do Git.
        </p>
      </section>
    </>
  );
}
