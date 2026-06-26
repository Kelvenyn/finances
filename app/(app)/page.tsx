import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">Inicio</span>
        <h1>Escolha qual financeiro voce quer olhar.</h1>
        <p>Os ambientes pessoal e empresarial ficam separados desde a primeira versao.</p>
      </header>

      <section className="choice-grid">
        <Link href="/personal" className="choice-card">
          <span>Pessoal</span>
          <h2>Vida pessoal</h2>
          <p>99Pay, Itau, cartoes, historico CSV, gastos e rendimentos pessoais.</p>
        </Link>
        <Link href="/business" className="choice-card">
          <span>Empresa</span>
          <h2>Operacao empresarial</h2>
          <p>Bancos conectados, custos, receitas e caixa da operacao de vendas online.</p>
        </Link>
      </section>
    </>
  );
}
