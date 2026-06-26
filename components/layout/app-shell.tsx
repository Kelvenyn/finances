"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";

const navigation = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/personal", label: "Pessoal", icon: "wallet" },
  { href: "/business", label: "Empresa", icon: "briefcase" },
  { href: "/transactions", label: "Movimentacoes", icon: "list" },
  { href: "/review", label: "Revisao", icon: "check" },
  { href: "/settings", label: "Ajustes", icon: "settings" },
] as const;

export function AppShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">F</span>
          <span>
            <strong>Finance Core</strong>
            <small>Kelvenyn</small>
          </span>
        </Link>

        <nav className="side-nav" aria-label="Navegacao principal">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={signOutAction} className="sidebar-footer">
          <span>{userEmail}</span>
          <button type="submit">Sair</button>
        </form>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <strong>Finance Core v1</strong>
            <span>Caixa pratico, separado por perfil</span>
          </div>
          <Link href="/settings" className="topbar-link">
            Integracoes
          </Link>
        </header>
        <main className="content-shell">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: (typeof navigation)[number]["icon"] }) {
  if (name === "home") return <svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5V20H5v-8.5Z" /></svg>;
  if (name === "wallet") return <svg viewBox="0 0 24 24"><path d="M4 7h15v12H4z" /><path d="M16 12h4v4h-4z" /></svg>;
  if (name === "briefcase") return <svg viewBox="0 0 24 24"><path d="M4 8h16v11H4z" /><path d="M9 8V5h6v3" /></svg>;
  if (name === "list") return <svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>;
  if (name === "check") return <svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" /></svg>;
  return <svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="M4 12h2m12 0h2M12 4v2m0 12v2" /></svg>;
}
