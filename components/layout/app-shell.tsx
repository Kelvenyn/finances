"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Visão geral", icon: "overview" },
  { href: "/transactions", label: "Transações", icon: "transactions" },
  { href: "/review", label: "Revisar", icon: "review" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><span className="brand-mark">N</span><span><strong>Nexo</strong><small>Financeiro</small></span></div>
      <nav className="side-nav" aria-label="Navegação principal">
        <span className="nav-caption">Painel</span>
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={active ? "active" : ""}><NavIcon name={item.icon} /><span>{item.label}</span>{item.href === "/review" && <span className="nav-dot" />}</Link>;
        })}
      </nav>
      <div className="sidebar-status"><div className="status-heading"><span className="status-dot" /> Dados protegidos</div><p>Sincronização segura via Open Finance.</p></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="mobile-brand"><span className="brand-mark">N</span><strong>Nexo</strong></div>
        <div className="topbar-context"><span className="live-dot" /> 4 bancos conectados</div>
        <div className="topbar-actions"><span className="last-sync">Atualizado recentemente</span><button className="icon-button" aria-label="Notificações"><BellIcon /><span className="notification-dot" /></button><div className="avatar" aria-label="Perfil de Kelvenyn">K</div></div>
      </header>
      <main className="content-shell">{children}</main>
    </div>
    <nav className="mobile-nav" aria-label="Navegação mobile">
      {navigation.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={active ? "active" : ""}><NavIcon name={item.icon} /><span>{item.label}</span></Link>; })}
    </nav>
  </div>;
}

function NavIcon({ name }: { name: "overview" | "transactions" | "review" }) {
  if (name === "transactions") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
  if (name === "review") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l2 2 4-4M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9zm0 7h6v-4H4v4zm10 0h6v-9h-6v9zm0-16v4h6V4h-6z" /></svg>;
}

function BellIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>; }
