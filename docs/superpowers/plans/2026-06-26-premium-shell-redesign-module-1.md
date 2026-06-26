# Premium Shell Redesign Module 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the functional app shell with a premium dark workspace foundation with new routes, active profile switching, collapsible navigation, mobile-priority layout, and working appearance preferences.

**Architecture:** Keep the existing Supabase data model and finance query layer. Add a focused preferences layer using browser persistence for Module 1, a premium app shell that owns navigation/profile/theme state, and route wrappers that reuse existing dashboard/transactions/settings data while moving the product to `/dashboard`, `/lancamentos`, `/faturas`, and `/configuracoes`.

**Tech Stack:** Next.js App Router, TypeScript, React client components for UI preferences, Supabase Auth, existing server components/data helpers, CSS custom properties in `app/globals.css`, Node test runner via `node --import tsx --test`.

## Global Constraints

- Authenticated app uses the new dark premium shell.
- Sidebar has only Dashboard, Lançamentos, Faturas, Configurações, Sair.
- Active profile selector appears at the top and switches profile context.
- New routes exist and old routes redirect.
- Appearance settings can change mode, palette, sidebar preference, hide values, default period, and default profile.
- Preferences persist across refreshes.
- Desktop and mobile layouts are intentionally different.
- Typecheck, lint, tests, and build pass.
- No secrets, tokens, real CSVs, or sensitive values are committed.
- Full premium dashboard redesign is out of scope for this module.
- Editable transactions side panel or bottom sheet is out of scope for this module.
- Full faturas integration and bill details are out of scope for this module.

---

## File Structure

- `lib/ui/preferences.ts`: typed preference defaults, palette catalog, URL/profile helpers, and CSS variable mapping.
- `tests/ui-preferences.test.ts`: pure tests for preference/profile/palette helpers.
- `components/layout/premium-shell.tsx`: authenticated shell with sidebar, topbar, profile toggle, mobile navigation, and preference provider.
- `components/layout/profile-switcher.tsx`: segmented `Pessoal | Empresarial` control that preserves current route and query parameters.
- `components/layout/appearance-provider.tsx`: client-side localStorage preference state and document attributes/CSS variables.
- `components/layout/nav-icons.tsx`: local icon renderer for shell navigation.
- `components/settings/appearance-settings.tsx`: functioning settings UI for mode, palette, sidebar, hide values, period, and default profile.
- `app/(app)/dashboard/page.tsx`: new dashboard route reusing current personal/business dashboards based on active profile.
- `app/(app)/lancamentos/page.tsx`: new launches route reusing current transactions list with active profile.
- `app/(app)/faturas/page.tsx`: premium empty/placeholder faturas route by active profile.
- `app/(app)/configuracoes/page.tsx`: settings route with subtabs and working Appearance section.
- Legacy pages under `app/(app)/personal`, `business`, `transactions`, `review`, `settings`: redirect to new routes.
- `app/globals.css`: dark premium theme, shell layout, mobile priority nav, settings panels, animations.
- `AGENTS.md`: update current state and next steps.

---

### Task 1: Preferences And Palette Foundation

**Files:**
- Create: `lib/ui/preferences.ts`
- Create: `tests/ui-preferences.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `type ProfileType = "personal" | "business"` imported from `@/lib/types`
- Produces: `type AppearanceMode = "dark" | "light" | "system"`
- Produces: `type SidebarPreference = "auto" | "expanded" | "collapsed"`
- Produces: `type DashboardPeriod = "7d" | "30d" | "90d" | "ytd" | "all"`
- Produces: `type PremiumPreferences`
- Produces: `const defaultPremiumPreferences: PremiumPreferences`
- Produces: `const premiumPalettes: PremiumPalette[]`
- Produces: `parseProfile(value?: string | null): ProfileType`
- Produces: `profileMeta(profile: ProfileType): { label: string; subtitle: string; iconLabel: string }`
- Produces: `paletteToCssVariables(paletteId: string): Record<string, string>`
- Produces: `mergePreferences(input: Partial<PremiumPreferences>): PremiumPreferences`

- [ ] **Step 1: Ensure test script exists**

In `package.json`, keep or add:

```json
"test": "node --import tsx --test tests/*.test.ts"
```

- [ ] **Step 2: Write failing tests**

Create `tests/ui-preferences.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defaultPremiumPreferences,
  mergePreferences,
  paletteToCssVariables,
  parseProfile,
  premiumPalettes,
  profileMeta,
} from "@/lib/ui/preferences";

test("parseProfile defaults to personal", () => {
  assert.equal(parseProfile(undefined), "personal");
  assert.equal(parseProfile("business"), "business");
  assert.equal(parseProfile("personal"), "personal");
  assert.equal(parseProfile("invalid"), "personal");
});

test("profileMeta returns account-like presentation", () => {
  assert.deepEqual(profileMeta("personal"), {
    label: "Pessoal",
    subtitle: "Vida pessoal",
    iconLabel: "P",
  });
  assert.deepEqual(profileMeta("business"), {
    label: "Empresarial",
    subtitle: "Operação empresarial",
    iconLabel: "E",
  });
});

test("premiumPalettes includes ten palettes", () => {
  assert.equal(premiumPalettes.length, 10);
  assert.ok(premiumPalettes.some((palette) => palette.id === "ciano-executivo"));
  assert.ok(premiumPalettes.some((palette) => palette.id === "slate-pro"));
});

test("paletteToCssVariables returns required css tokens", () => {
  const variables = paletteToCssVariables("ciano-executivo");
  assert.equal(typeof variables["--bg"], "string");
  assert.equal(typeof variables["--surface"], "string");
  assert.equal(typeof variables["--accent"], "string");
  assert.equal(typeof variables["--positive"], "string");
  assert.equal(typeof variables["--negative"], "string");
});

test("mergePreferences keeps valid values and repairs invalid ones", () => {
  const merged = mergePreferences({
    mode: "light",
    palette: "slate-pro",
    sidebar: "collapsed",
    hideValues: true,
    defaultPeriod: "30d",
    defaultProfile: "business",
    dashboardBlocks: ["balance", "alerts"],
  });

  assert.deepEqual(merged, {
    ...defaultPremiumPreferences,
    mode: "light",
    palette: "slate-pro",
    sidebar: "collapsed",
    hideValues: true,
    defaultPeriod: "30d",
    defaultProfile: "business",
    dashboardBlocks: ["balance", "alerts"],
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' test
```

Expected: FAIL because `@/lib/ui/preferences` does not exist.

- [ ] **Step 4: Implement preferences**

Create `lib/ui/preferences.ts`:

```ts
import type { ProfileType } from "@/lib/types";

export type AppearanceMode = "dark" | "light" | "system";
export type SidebarPreference = "auto" | "expanded" | "collapsed";
export type DashboardPeriod = "7d" | "30d" | "90d" | "ytd" | "all";

export type PremiumPreferences = {
  mode: AppearanceMode;
  palette: string;
  sidebar: SidebarPreference;
  hideValues: boolean;
  defaultPeriod: DashboardPeriod;
  defaultProfile: ProfileType;
  dashboardBlocks: string[];
};

export type PremiumPalette = {
  id: string;
  name: string;
  swatches: string[];
  variables: Record<string, string>;
};

export const defaultDashboardBlocks = [
  "balance",
  "income",
  "expense",
  "bills",
  "review",
  "balanceChart",
  "barChart",
  "categories",
  "alerts",
  "recentTransactions",
];

export const defaultPremiumPreferences: PremiumPreferences = {
  mode: "dark",
  palette: "ciano-executivo",
  sidebar: "auto",
  hideValues: false,
  defaultPeriod: "90d",
  defaultProfile: "personal",
  dashboardBlocks: defaultDashboardBlocks,
};

export const premiumPalettes: PremiumPalette[] = [
  palette("ciano-executivo", "Ciano Executivo", ["#07111f", "#102234", "#22d3ee"], "#22d3ee", "#14b8a6"),
  palette("verde-capital", "Verde Capital", ["#06130f", "#10251d", "#34d399"], "#34d399", "#84cc16"),
  palette("azul-petroleo", "Azul Petróleo", ["#07151d", "#102a34", "#2dd4bf"], "#2dd4bf", "#38bdf8"),
  palette("ambar-premium", "Âmbar Premium", ["#151006", "#2a2112", "#f59e0b"], "#f59e0b", "#22c55e"),
  palette("roxo-noturno", "Roxo Noturno", ["#10091d", "#211536", "#a78bfa"], "#a78bfa", "#22d3ee"),
  palette("safira", "Safira", ["#071022", "#111d3a", "#60a5fa"], "#60a5fa", "#94a3b8"),
  palette("neon-controlado", "Neon Controlado", ["#050b0f", "#102027", "#00e5a8"], "#00e5a8", "#22d3ee"),
  palette("minimal-dark", "Minimal Dark", ["#09090b", "#18181b", "#e4e4e7"], "#e4e4e7", "#71717a"),
  palette("bordo-financeiro", "Bordo Financeiro", ["#14070b", "#2a1118", "#f43f5e"], "#f43f5e", "#fbbf24"),
  palette("slate-pro", "Slate Pro", ["#0b1120", "#1e293b", "#38bdf8"], "#38bdf8", "#22c55e"),
];

function palette(id: string, name: string, swatches: string[], accent: string, accent2: string): PremiumPalette {
  return {
    id,
    name,
    swatches,
    variables: {
      "--bg": swatches[0],
      "--surface": swatches[1],
      "--surface-soft": "#111827",
      "--surface-elevated": "#172033",
      "--line": "rgba(148, 163, 184, 0.18)",
      "--ink": "#f8fafc",
      "--muted": "#94a3b8",
      "--subtle": "#64748b",
      "--accent": accent,
      "--accent-2": accent2,
      "--positive": "#22c55e",
      "--negative": "#fb7185",
      "--warning": "#f59e0b",
    },
  };
}

export function parseProfile(value?: string | null): ProfileType {
  return value === "business" ? "business" : "personal";
}

export function profileMeta(profile: ProfileType) {
  return profile === "business"
    ? { label: "Empresarial", subtitle: "Operação empresarial", iconLabel: "E" }
    : { label: "Pessoal", subtitle: "Vida pessoal", iconLabel: "P" };
}

export function paletteToCssVariables(paletteId: string) {
  return (premiumPalettes.find((palette) => palette.id === paletteId) ?? premiumPalettes[0]).variables;
}

export function mergePreferences(input: Partial<PremiumPreferences>): PremiumPreferences {
  const palette = premiumPalettes.some((item) => item.id === input.palette) ? input.palette! : defaultPremiumPreferences.palette;
  return {
    mode: input.mode === "light" || input.mode === "system" || input.mode === "dark" ? input.mode : defaultPremiumPreferences.mode,
    palette,
    sidebar:
      input.sidebar === "expanded" || input.sidebar === "collapsed" || input.sidebar === "auto"
        ? input.sidebar
        : defaultPremiumPreferences.sidebar,
    hideValues: Boolean(input.hideValues),
    defaultPeriod:
      input.defaultPeriod === "7d" ||
      input.defaultPeriod === "30d" ||
      input.defaultPeriod === "90d" ||
      input.defaultPeriod === "ytd" ||
      input.defaultPeriod === "all"
        ? input.defaultPeriod
        : defaultPremiumPreferences.defaultPeriod,
    defaultProfile: parseProfile(input.defaultProfile),
    dashboardBlocks: Array.isArray(input.dashboardBlocks) ? input.dashboardBlocks : defaultPremiumPreferences.dashboardBlocks,
  };
}
```

- [ ] **Step 5: Run tests**

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' test
```

Expected: PASS.

---

### Task 2: Preference Provider And Profile Switcher

**Files:**
- Create: `components/layout/appearance-provider.tsx`
- Create: `components/layout/profile-switcher.tsx`
- Create: `components/layout/nav-icons.tsx`

**Interfaces:**
- Consumes: `PremiumPreferences`, `mergePreferences`, `paletteToCssVariables`, `parseProfile`, `profileMeta`
- Produces: `useAppearance(): { preferences, setPreference, setPreferences }`
- Produces: `ProfileSwitcher({ profile }: { profile: ProfileType })`
- Produces: `NavIcon({ name }: { name: PremiumNavIcon })`

- [ ] **Step 1: Create appearance provider**

Create `components/layout/appearance-provider.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultPremiumPreferences,
  mergePreferences,
  paletteToCssVariables,
  type PremiumPreferences,
} from "@/lib/ui/preferences";

type AppearanceContextValue = {
  preferences: PremiumPreferences;
  setPreference: <K extends keyof PremiumPreferences>(key: K, value: PremiumPreferences[K]) => void;
  setPreferences: (next: PremiumPreferences) => void;
};

const STORAGE_KEY = "finance-core-premium-preferences";
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState(defaultPremiumPreferences);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setPreferencesState(mergePreferences(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = preferences.mode;
    root.dataset.palette = preferences.palette;
    root.dataset.sidebar = preferences.sidebar;
    root.dataset.hideValues = String(preferences.hideValues);
    for (const [key, value] of Object.entries(paletteToCssVariables(preferences.palette))) {
      root.style.setProperty(key, value);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      preferences,
      setPreference(key, preferenceValue) {
        setPreferencesState((current) => mergePreferences({ ...current, [key]: preferenceValue }));
      },
      setPreferences(next) {
        setPreferencesState(mergePreferences(next));
      },
    }),
    [preferences],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside AppearanceProvider");
  return context;
}
```

- [ ] **Step 2: Create profile switcher**

Create `components/layout/profile-switcher.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ProfileType } from "@/lib/types";
import { profileMeta } from "@/lib/ui/preferences";

export function ProfileSwitcher({ profile }: { profile: ProfileType }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const meta = profileMeta(profile);

  function hrefFor(nextProfile: ProfileType) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("profile", nextProfile);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="profile-switcher">
      <div className="active-profile">
        <span className="profile-avatar">{meta.iconLabel}</span>
        <span>
          <strong>{meta.label}</strong>
          <small>{meta.subtitle}</small>
        </span>
      </div>
      <div className="profile-segmented" aria-label="Perfil financeiro ativo">
        <Link href={hrefFor("personal")} className={profile === "personal" ? "active" : ""}>
          Pessoal
        </Link>
        <Link href={hrefFor("business")} className={profile === "business" ? "active" : ""}>
          Empresarial
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create nav icons**

Create `components/layout/nav-icons.tsx`:

```tsx
export type PremiumNavIcon = "dashboard" | "transactions" | "bills" | "settings" | "logout" | "collapse";

export function NavIcon({ name }: { name: PremiumNavIcon }) {
  if (name === "dashboard") return <svg viewBox="0 0 24 24"><path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" /></svg>;
  if (name === "transactions") return <svg viewBox="0 0 24 24"><path d="M7 7h13M7 12h13M7 17h13M4 7h.01M4 12h.01M4 17h.01" /></svg>;
  if (name === "bills") return <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></svg>;
  if (name === "settings") return <svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="M4 12h2m12 0h2M12 4v2m0 12v2" /></svg>;
  if (name === "logout") return <svg viewBox="0 0 24 24"><path d="M10 17 15 12l-5-5" /><path d="M15 12H3" /><path d="M21 4v16h-7" /></svg>;
  return <svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6" /></svg>;
}
```

- [ ] **Step 4: Run typecheck**

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run typecheck
```

Expected: PASS.

---

### Task 3: Premium Shell And Route Context

**Files:**
- Replace: `components/layout/app-shell.tsx`
- Modify: `app/(app)/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `AppearanceProvider`
- Consumes: `ProfileSwitcher`
- Consumes: `NavIcon`
- Consumes: `signOutAction`

- [ ] **Step 1: Replace app shell**

Replace `components/layout/app-shell.tsx` with a premium shell that:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { parseProfile } from "@/lib/ui/preferences";
import { AppearanceProvider, useAppearance } from "./appearance-provider";
import { NavIcon, type PremiumNavIcon } from "./nav-icons";
import { ProfileSwitcher } from "./profile-switcher";

const navigation: Array<{ href: string; label: string; icon: PremiumNavIcon }> = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/lancamentos", label: "Lançamentos", icon: "transactions" },
  { href: "/faturas", label: "Faturas", icon: "bills" },
  { href: "/configuracoes", label: "Configurações", icon: "settings" },
];

export function AppShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  return (
    <AppearanceProvider>
      <PremiumShellContent userEmail={userEmail}>{children}</PremiumShellContent>
    </AppearanceProvider>
  );
}

function PremiumShellContent({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preferences, setPreference } = useAppearance();
  const profile = parseProfile(searchParams.get("profile") ?? preferences.defaultProfile);

  function hrefWithProfile(href: string) {
    return `${href}?profile=${profile}`;
  }

  return (
    <div className="premium-shell">
      <aside className="premium-sidebar">
        <Link href={hrefWithProfile("/dashboard")} className="premium-brand">
          <span className="premium-brand-mark">F</span>
          <span className="premium-brand-copy">
            <strong>Finance Core</strong>
            <small>Workspace</small>
          </span>
        </Link>

        <nav className="premium-nav" aria-label="Navegação principal">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={hrefWithProfile(item.href)} className={active ? "active" : ""} aria-label={item.label}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setPreference("sidebar", preferences.sidebar === "collapsed" ? "expanded" : "collapsed")}
        >
          <NavIcon name="collapse" />
          <span>{preferences.sidebar === "collapsed" ? "Expandir" : "Recolher"}</span>
        </button>

        <form action={signOutAction} className="premium-logout">
          <span>{userEmail}</span>
          <button type="submit">
            <NavIcon name="logout" />
            <span>Sair</span>
          </button>
        </form>
      </aside>

      <div className="premium-workspace">
        <header className="premium-topbar">
          <ProfileSwitcher profile={profile} />
          <div className="topbar-actions">
            <Link href={hrefWithProfile("/configuracoes")} className="topbar-link">
              Aparência
            </Link>
          </div>
        </header>
        <main className="premium-content">{children}</main>
        <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
          {navigation.map((item) => (
            <Link key={item.href} href={hrefWithProfile(item.href)} className={pathname.startsWith(item.href) ? "active" : ""}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Keep protected layout unchanged except shell import compatibility**

`app/(app)/layout.tsx` should still render:

```tsx
return <AppShell userEmail={data.user.email ?? "Kelvenyn"}>{children}</AppShell>;
```

- [ ] **Step 3: Add shell CSS**

In `app/globals.css`, add premium variables and classes for:

- `.premium-shell`
- `.premium-sidebar`
- `.premium-brand`
- `.premium-nav`
- `.sidebar-toggle`
- `.premium-logout`
- `.premium-workspace`
- `.premium-topbar`
- `.premium-content`
- `.profile-switcher`
- `.active-profile`
- `.profile-segmented`
- `.mobile-bottom-nav`

Ensure desktop large has expanded sidebar, `[data-sidebar="collapsed"]` collapses it, and mobile hides sidebar while showing `.mobile-bottom-nav`.

- [ ] **Step 4: Run verification**

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run typecheck
```

Expected: PASS.

---

### Task 4: New Routes And Legacy Redirects

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Create: `app/(app)/lancamentos/page.tsx`
- Create: `app/(app)/faturas/page.tsx`
- Create: `app/(app)/configuracoes/page.tsx`
- Replace: `app/(app)/personal/page.tsx`
- Replace: `app/(app)/business/page.tsx`
- Replace: `app/(app)/transactions/page.tsx`
- Replace: `app/(app)/review/page.tsx`
- Replace: `app/(app)/settings/page.tsx`
- Modify: `app/(app)/page.tsx`

**Interfaces:**
- Consumes: `parseProfile`
- Consumes: `PersonalDashboard`
- Consumes: `ProfileDashboard`
- Consumes: `TransactionsTable`
- Consumes: `listTransactions`, `listAccounts`, `listCategories`
- Produces: new premium route entry points

- [ ] **Step 1: Create `/dashboard`**

`app/(app)/dashboard/page.tsx`:

```tsx
import { PersonalDashboard } from "@/components/finance/personal-dashboard";
import { ProfileDashboard } from "@/components/finance/profile-dashboard";
import { parsePersonalDashboardPeriod } from "@/lib/data/personal-dashboard";
import { parseProfile } from "@/lib/ui/preferences";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const profile = parseProfile(params.profile);
  if (profile === "personal") return <PersonalDashboard period={parsePersonalDashboardPeriod(params.period)} />;
  return <ProfileDashboard profile="business" />;
}
```

- [ ] **Step 2: Create `/lancamentos`**

Move the current transactions page behavior into `app/(app)/lancamentos/page.tsx`, using `parseProfile(params.profile)` as default profile and preserving filters.

- [ ] **Step 3: Create `/faturas`**

`app/(app)/faturas/page.tsx`:

```tsx
import { parseProfile, profileMeta } from "@/lib/ui/preferences";

export const dynamic = "force-dynamic";

export default async function FaturasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const profile = parseProfile(params.profile);
  const meta = profileMeta(profile);

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">Faturas</span>
        <h1>Faturas {meta.label.toLowerCase()}.</h1>
        <p>Cartões e faturas aparecem aqui quando o Banco MCP entregar contas de crédito para este perfil.</p>
      </header>
      <section className="panel empty-state premium-empty">
        <strong>Nenhuma fatura conectada neste perfil.</strong>
        <p>Este módulo já respeita o perfil ativo e será expandido quando validarmos os dados de cartão.</p>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Create `/configuracoes`**

Create `app/(app)/configuracoes/page.tsx` that renders the settings shell and `AppearanceSettings` from Task 5.

- [ ] **Step 5: Redirect legacy pages**

Use `redirect` from `next/navigation`:

```tsx
import { redirect } from "next/navigation";

export default function PersonalPage() {
  redirect("/dashboard?profile=personal");
}
```

Apply equivalents:

- `/business` -> `/dashboard?profile=business`
- `/transactions` -> `/lancamentos`
- `/review` -> `/lancamentos?status=review`
- `/settings` -> `/configuracoes`
- `/` -> `/dashboard`

- [ ] **Step 6: Run build**

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and route list includes `/dashboard`, `/lancamentos`, `/faturas`, `/configuracoes`.

---

### Task 5: Appearance Settings

**Files:**
- Create: `components/settings/appearance-settings.tsx`
- Modify: `app/(app)/configuracoes/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `useAppearance`
- Consumes: `premiumPalettes`, `profileMeta`

- [ ] **Step 1: Create appearance settings component**

Create `components/settings/appearance-settings.tsx` with:

- Mode segmented control.
- Palette grid with 10 palettes and swatches.
- Sidebar segmented control.
- Hide values toggle.
- Default period select.
- Default profile segmented control.
- Dashboard blocks checkboxes.

The component should call `setPreference` immediately on selection.

- [ ] **Step 2: Add settings subtabs**

`app/(app)/configuracoes/page.tsx` should show:

- Geral.
- Aparência.
- Contas.
- Categorias.
- Integrações.
- Segurança.

Only Aparência must be fully functioning in Module 1. Other sections can render organized premium placeholder panels with current data links/copy.

- [ ] **Step 3: Add settings CSS**

Add:

- `.settings-tabs`
- `.settings-layout`
- `.appearance-grid`
- `.palette-grid`
- `.palette-option`
- `.palette-swatches`
- `.settings-control`
- `.toggle-row`
- `.dashboard-block-list`

- [ ] **Step 4: Manual behavior check**

Open `/configuracoes?profile=personal` locally and confirm:

- Palette changes CSS variables.
- Mode changes `data-theme`.
- Sidebar preference changes `data-sidebar`.
- Hide values changes `data-hide-values`.
- Refresh preserves preferences.

---

### Task 6: Premium CSS Polish And Mobile Behavior

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: shell classes from Task 3
- Consumes: settings classes from Task 5

- [ ] Add dark premium base styling to `:root`, `html`, and `body`.
- [ ] Add light/system fallback selectors for `[data-theme="light"]`.
- [ ] Add value hiding with `[data-hide-values="true"] .amount, [data-hide-values="true"] .stat-card strong`.
- [ ] Add card entry animation using `@keyframes panel-in`.
- [ ] Add sidebar width transitions.
- [ ] Add mobile media query that hides `.premium-sidebar` and shows `.mobile-bottom-nav`.
- [ ] Verify text does not overlap in sidebar collapsed mode.
- [ ] Verify buttons and tabs keep stable height.

---

### Task 7: Documentation And Verification

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: all previous tasks

- [ ] Update `AGENTS.md` with:

```md
- Premium shell redesign Module 1 spec saved in `docs/superpowers/specs/2026-06-26-premium-shell-redesign-module-1.md`.
- Premium shell redesign Module 1 plan saved in `docs/superpowers/plans/2026-06-26-premium-shell-redesign-module-1.md`.
- New target routes: `/dashboard`, `/lancamentos`, `/faturas`, `/configuracoes`.
```

- [ ] Run tests:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' test
```

Expected: PASS.

- [ ] Run typecheck:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run typecheck
```

Expected: PASS.

- [ ] Run lint:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run lint
```

Expected: PASS.

- [ ] Run build:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path; & 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS.

- [ ] Commit and push if Git permissions allow:

```powershell
git add AGENTS.md app components lib tests docs package.json
git commit -m "Build premium shell redesign module 1"
git push origin codex/ui-foundation
```

Expected: branch pushed and Vercel deploy starts.

---

## Self-Review

Spec coverage:

- Navigation model is covered by Tasks 3 and 4.
- Active profile model is covered by Tasks 1, 2, 3, and 4.
- Route model is covered by Task 4.
- Visual direction, layout, sidebar, mobile, and animation are covered by Tasks 3 and 6.
- Appearance settings and palettes are covered by Tasks 1 and 5.
- Dashboard customization foundation is covered by Tasks 1 and 5.
- Page responsibilities are covered by Task 4.
- Verification is covered by Task 7.

Placeholder scan:

- No `TODO`, `TBD`, or undefined task references are intentionally left.

Type consistency:

- `ProfileType` remains imported from `@/lib/types`.
- Preference helper names used in later tasks are defined in Task 1.
- UI component names used in later tasks are defined in Task 2 and Task 5.
