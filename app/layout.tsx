import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "FinanceHub", description: "Finanças pessoais e empresariais em um só lugar" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <header className="nav"><div className="shell nav-inner">
      <Link href="/" className="brand">FinanceHub</Link>
      <nav className="links"><Link href="/">Visão geral</Link><Link href="/transactions">Transações</Link><Link href="/review">Revisar</Link></nav>
    </div></header>
    <main className="shell">{children}</main>
  </body></html>;
}

