"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { AppearanceProvider, useAppearance } from "@/components/layout/appearance-provider";
import { NavIcon, type NavIconName } from "@/components/layout/nav-icons";
import { ProfileSwitcher } from "@/components/layout/profile-switcher";

const navigation: Array<{ href: string; label: string; icon: NavIconName }> = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/lancamentos", label: "Lancamentos", icon: "transactions" },
  { href: "/faturas", label: "Faturas", icon: "cards" },
  { href: "/configuracoes", label: "Configuracoes", icon: "settings" },
];

export function AppShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <AppearanceProvider>
      <PremiumShell userEmail={userEmail}>{children}</PremiumShell>
    </AppearanceProvider>
  );
}

function PremiumShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preferences } = useAppearance();
  const [manualCollapsed, setManualCollapsed] = useState(false);

  const profileQuery = searchParams.get("profile") ?? preferences.defaultProfile;
  const shellClassName = useMemo(() => {
    const classes = ["premium-app-shell"];
    if (manualCollapsed || preferences.sidebar === "collapsed") {
      classes.push("sidebar-collapsed");
    }
    if (preferences.sidebar === "expanded") {
      classes.push("sidebar-expanded");
    }
    return classes.join(" ");
  }, [manualCollapsed, preferences.sidebar]);

  return (
    <div className={shellClassName}>
      <aside className="premium-sidebar">
        <div className="sidebar-brand-row">
          <Link href={`/dashboard?profile=${profileQuery}`} className="premium-brand">
            <span className="brand-mark">F</span>
            <span className="brand-copy">
              <strong>Finance Core</strong>
              <small>Kelvenyn</small>
            </span>
          </Link>
          <button
            type="button"
            className="icon-button sidebar-toggle"
            onClick={() => setManualCollapsed((current) => !current)}
            aria-label="Abrir ou fechar menu lateral"
          >
            <NavIcon name="chevron" />
          </button>
        </div>

        <nav className="premium-nav" aria-label="Navegacao principal">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const href = `${item.href}?profile=${profileQuery}`;
            return (
              <Link key={item.href} href={href} className={active ? "active" : ""}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={signOutAction} className="premium-signout">
          <span className="user-pill">{userEmail}</span>
          <button type="submit">
            <NavIcon name="logout" />
            <span>Sair</span>
          </button>
        </form>
      </aside>

      <div className="premium-workspace">
        <header className="premium-topbar">
          <div className="topbar-title">
            <span className="eyebrow">Finance Core</span>
            <strong>Painel financeiro</strong>
          </div>
          <ProfileSwitcher />
        </header>

        <main className="premium-content">{children}</main>

        <nav className="mobile-tabbar" aria-label="Navegacao principal mobile">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={`${item.href}?profile=${profileQuery}`}
                className={active ? "active" : ""}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
