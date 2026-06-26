# Personal Dashboard Sync Design

## Context

Finance Core v1 already has Supabase Auth, personal/business separation, Banco MCP sync, CSV historical import, dashboards, transactions, review, and settings.

The next product step focuses only on the personal desktop experience. Business finance, Facebook Ads, tracking, offers, creatives, checkout, and advanced card automation stay outside this slice.

Banco MCP is treated as a read-only external source. Supabase is the system of record: every transaction we want to analyze must be saved there.

## Goal

Build the next personal finance workflow around a practical daily loop:

1. Kelvenyn opens the personal dashboard.
2. He clicks `Atualizar agora`.
3. The app fetches recent Banco MCP data.
4. New transactions are saved in Supabase.
5. The dashboard recalculates personal balances, monthly numbers, chart data, and review counts.

## Primary Screen

The `/personal` desktop page becomes the main personal finance panel.

Top area:

- Primary button: `Atualizar agora`.
- Last sync status/time.
- KPI cards:
  - Saldo atual total.
  - Entradas do mês.
  - Saídas do mês.
  - Resultado do mês.
  - Pendentes de revisão.
  - Última atualização.

Main area:

- Line chart: saldo dia a dia.
- Default period: last 90 days.
- Quick filters:
  - 30 dias.
  - 90 dias.
  - Ano atual.
  - Todo histórico.

Lower area:

- Recent personal transactions.
- Pending review summary.
- Shortcut to the full transactions page.

## Balance Model

Use a mixed model:

- Current balance comes from personal Banco MCP account balances saved in `accounts.current_balance`.
- Historical daily balance is calculated from Supabase transactions.

The current balance is the anchor. The chart reconstructs previous days by walking backward from the current balance and applying daily transaction net movement in reverse.

Example:

- Current balance today: R$ 1,000.
- Today had R$ 100 income and R$ 40 expense.
- Yesterday estimated ending balance: R$ 940.

This gives a useful day-by-day trend even if Banco MCP only returns the current balance.

## Sync Behavior

`Atualizar agora` performs a normal recent sync, not a full backfill.

Expected behavior:

- Call the existing Banco MCP sync path.
- Save new Banco MCP accounts and transactions in Supabase.
- Preserve manual review/categorization already done.
- New Banco MCP transactions enter review by default.
- Revalidate the personal dashboard, review page, transactions page, and settings page.

Backfill/reprocessing remains a secondary maintenance action in settings/integrations, not the main button.

## Transactions Review Rule

For this slice:

- Every new Banco MCP transaction enters review.
- Existing manually reviewed transactions must not return to review after sync.
- Automatic category learning is explicitly a later improvement.

Future category learning should use rules like normalized description, merchant, flow, profile, and account, but it is not part of this implementation.

## Transactions Page

The full transactions page remains the detailed place for filtering.

This slice should improve or prepare the page for personal workflows:

- Filters should support profile, period, flow, source, account, category, and text search.
- The personal dashboard shortcut should open transactions with `profile=personal`.

## Data Requirements

Existing tables remain useful:

- `accounts`
- `transactions`
- `categories`
- `sync_runs`

Potential additions are allowed only if needed:

- A small helper/query layer for personal dashboard data.
- No new financial domain table unless the implementation proves it is necessary.

Credit card bills, card limits, due dates, and last four digits are important future requirements, but they depend on validating exactly what Banco MCP exposes. They are not part of this slice.

## Error Handling

The dashboard button should show clear user-facing states:

- Idle.
- Syncing.
- Success.
- Failure.

Technical errors must not expose secrets or raw external payloads. Detailed failure information can stay in server logs and `sync_runs`.

## Testing And Verification

Before completing implementation:

- `npm run typecheck` must pass.
- `npm run lint` must pass.
- `npm run build` must pass.
- Manual verification should confirm:
  - Personal dashboard loads.
  - `Atualizar agora` triggers sync.
  - Personal dashboard does not show business transactions.
  - New Banco MCP transactions remain saved in Supabase.
  - Reviewed transactions stay reviewed after another sync.
  - 90-day chart renders non-empty when personal data exists.

## Out Of Scope

- Business dashboard changes.
- Facebook Ads/Utmify/tracking.
- Offers and creatives.
- Checkout/revenue integration.
- Automatic category learning.
- Full credit-card bills UI.
- Mobile-specific layout polish.
