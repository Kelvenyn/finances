# Personal Dashboard Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the personal desktop dashboard with a daily Banco MCP sync button, top KPIs, and a 90-day default balance chart.

**Architecture:** Keep business dashboard behavior intact and introduce personal-specific data helpers/components. Use Supabase as the system of record, Banco MCP as read-only sync source, and an SVG chart to avoid adding chart dependencies.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Server Actions, Supabase, Tailwind/global CSS, Node test runner via `node --import tsx --test`.

## Global Constraints

- Focus only on the personal desktop experience.
- Do not commit secrets, tokens, `.env.local`, or CSV data.
- `Atualizar agora` performs recent sync only, not backfill.
- Current balance uses personal non-credit account balances.
- Historical chart uses Supabase transactions and anchors on current balance.
- Default chart period is 90 days with filters for 30 days, 90 days, year-to-date, and all history.
- New Banco MCP transactions enter review by default; category learning is out of scope.
- Business dashboard changes are out of scope.

---

### Task 1: Personal Dashboard Data Model

**Files:**
- Create: `lib/data/personal-dashboard.ts`
- Create: `tests/personal-dashboard.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `getPersonalDashboardData(period: PersonalDashboardPeriod): Promise<PersonalDashboardData>`
- Produces: `buildDailyBalanceSeries(args: BuildDailyBalanceSeriesArgs): BalancePoint[]`
- Produces: `parsePersonalDashboardPeriod(value?: string): PersonalDashboardPeriod`

- [ ] Add a test script using Node's test runner with `tsx`.
- [ ] Write failing tests for period parsing and daily balance reconstruction.
- [ ] Implement pure helpers for period parsing, date windows, daily net movement, and reverse balance reconstruction.
- [ ] Implement Supabase query wrapper for personal dashboard data.
- [ ] Run `npm test` and verify tests pass.

### Task 2: Personal Sync Action And Button

**Files:**
- Create: `app/(app)/personal/actions.ts`
- Create: `components/finance/sync-now-button.tsx`

**Interfaces:**
- Produces: `syncPersonalNow(_: SyncActionState, formData: FormData): Promise<SyncActionState>`
- Consumes: existing `syncBancoMcp(false)`

- [ ] Write server action that runs recent Banco MCP sync and revalidates `/personal`, `/review`, `/transactions`, and `/settings`.
- [ ] Build client button with idle, syncing, success, and failure states.
- [ ] Ensure button does not expose `SYNC_SECRET` to the browser.

### Task 3: Personal Dashboard UI

**Files:**
- Create: `components/finance/balance-line-chart.tsx`
- Create: `components/finance/personal-dashboard.tsx`
- Modify: `app/(app)/personal/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `getPersonalDashboardData`
- Consumes: `syncPersonalNow`

- [ ] Render six KPI cards: saldo atual, entradas, saídas, resultado, pendentes, última atualização.
- [ ] Render period filters with 90 days active by default.
- [ ] Render an SVG balance chart that handles empty and flat data.
- [ ] Render recent personal transactions and review shortcut.
- [ ] Keep business dashboard using the old generic dashboard.

### Task 4: Transactions Filter Preparation

**Files:**
- Modify: `lib/data/finance.ts`
- Modify: `app/(app)/transactions/page.tsx`

**Interfaces:**
- Extends: `TransactionFilters` with `accountId?: string` and `categoryId?: string`

- [ ] Add account and category filters to the data query.
- [ ] Add filter dropdowns to the transactions page.
- [ ] Ensure `/transactions?profile=personal` remains the dashboard shortcut target.

### Task 5: Verification And Commit

**Files:**
- Modify: `AGENTS.md`

- [ ] Update `AGENTS.md` with the new dashboard state.
- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit and push if Git permissions allow.
