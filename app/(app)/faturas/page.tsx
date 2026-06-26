import { profileLabel } from "@/lib/format";
import { parseProfile } from "@/lib/ui/preferences";

export const dynamic = "force-dynamic";

export default async function FaturasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const profile = parseProfile(params.profile);

  return (
    <>
      <header className="page-heading premium-page-heading">
        <span className="eyebrow">{profileLabel(profile)}</span>
        <h1>Faturas</h1>
        <p>
          Area preparada para cartoes, faturas abertas, historico de fechamento
          e limites quando a fonte enviar esses dados.
        </p>
      </header>

      <section className="invoice-shell">
        <article className="premium-panel invoice-feature">
          <span className="eyebrow">Proxima etapa</span>
          <h2>Cartoes e faturas do {profileLabel(profile).toLowerCase()}</h2>
          <p>
            Aqui vao aparecer faturas abertas, compras pendentes, historico de
            pagamento e os ultimos quatro digitos dos cartoes.
          </p>
          <div className="invoice-preview-grid" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </article>

        <aside className="premium-panel invoice-notes">
          <h2>O que falta conectar</h2>
          <ul>
            <li>Listar cartoes retornados pelo Banco MCP.</li>
            <li>Salvar faturas e itens no Supabase.</li>
            <li>Separar faturas pagas, abertas e futuras.</li>
          </ul>
        </aside>
      </section>
    </>
  );
}
