# Premium Shell Redesign Module 1

## Context

Finance Core currently has functional pages for personal and business dashboards, transactions, review, settings, CSV import, Banco MCP sync, and Supabase Auth.

The product direction is changing from a simple functional finance app to a premium dark financial workspace. The new experience must support personal and business contexts without duplicating the sidebar into separate personal/business menu items.

This spec covers only Module 1: the global visual shell, navigation, profile context, route structure, preferences, and appearance system. It intentionally does not redesign the full dashboard, transactions editor, faturas experience, or advanced settings content yet.

## Product Goal

Create a premium dark app foundation that can carry the next modules:

- Dashboard premium.
- Lançamentos visual/editable.
- Faturas by active profile.
- Configurações with appearance, categories, integrations, and security.

The user should feel they are using one polished product where the active financial profile changes the data context.

## Navigation Model

The sidebar must contain only these primary tabs:

- Dashboard.
- Lançamentos.
- Faturas.
- Configurações.
- Sair.

The sidebar must not contain separate `Pessoal` and `Empresarial` navigation items.

## Active Profile Model

The active profile is a top-level context, similar to switching accounts.

Profiles:

- `personal`: label `Pessoal`, subtitle `Vida pessoal`.
- `business`: label `Empresarial`, subtitle `Operação empresarial`.

The top area must show:

- Profile icon.
- Active profile name.
- Active profile subtitle.
- Segmented toggle: `Pessoal | Empresarial`.

When the user switches profile:

- The current module stays active when possible.
- The URL changes to the same route with the new `profile` query.
- Data, filters, labels, and metrics switch to the selected profile.

Example:

- `/lancamentos?profile=personal` switches to `/lancamentos?profile=business`.

If the URL has no profile:

- Use saved default profile.
- If there is no saved preference, use `personal`.

## Route Model

Create premium routes:

- `/dashboard`
- `/lancamentos`
- `/faturas`
- `/configuracoes`

Legacy routes must redirect:

- `/personal` -> `/dashboard?profile=personal`
- `/business` -> `/dashboard?profile=business`
- `/transactions` -> `/lancamentos`
- `/settings` -> `/configuracoes`
- `/review` -> `/lancamentos?status=review`

The redirect behavior should preserve useful query parameters when practical, especially profile and review status.

## Visual Direction

Primary identity:

- Dark premium.
- Deep dark background.
- Graphite and dark blue/petroleum surfaces.
- Subtle borders.
- Clear strong typography.
- No neon-gamer look.
- No decorative blobs/orbs.
- Restrained premium glow only where it supports focus or hierarchy.

Financial semantics:

- Green for positive/receita.
- Red or warm orange for despesa/alert.
- Blue/cyan for neutral data and primary actions.
- Category colors should remain visible but not noisy.

## Layout Behavior

Desktop:

- Sidebar intelligent and manually controllable.
- Large desktop starts expanded.
- Medium desktop/notebook may start compact.
- User can manually expand/collapse.
- Main content adjusts smoothly without jarring jumps.

Mobile:

- No fixed desktop sidebar.
- Mobile uses priority navigation: bottom navigation or compact menu.
- Mobile dashboard prioritizes:
  - Saldo.
  - Faturas.
  - Pendências.
  - Últimos lançamentos.
  - Atualizar.

## Sidebar Behavior

Sidebar expanded:

- Shows icon and text.
- Shows brand/project identity.
- Has a clear collapse button.

Sidebar collapsed:

- Shows stable icon-only navigation.
- Text fades away.
- Tooltips or accessible labels must preserve clarity.

Preference:

- Sidebar mode should be saved.
- Options:
  - Automatic.
  - Expanded.
  - Collapsed.

## Appearance Settings

Module 1 must include functioning appearance settings under `/configuracoes`.

Required settings:

- Mode:
  - Dark.
  - Light.
  - System.
- Palette:
  - At least 10 premium palettes.
- Sidebar:
  - Automatic.
  - Expanded.
  - Collapsed.
- Hide values:
  - On/off.
- Default period:
  - 7D.
  - 30D.
  - 90D.
  - Ano.
  - Tudo.
- Default profile:
  - Pessoal.
  - Empresarial.

The settings UI must include a visual palette preview before applying.

## Palettes

Provide 10 initial premium palettes:

1. Ciano Executivo.
2. Verde Capital.
3. Azul Petróleo.
4. Âmbar Premium.
5. Roxo Noturno.
6. Safira.
7. Neon Controlado.
8. Minimal Dark.
9. Bordo Financeiro.
10. Slate Pro.

Each palette should define at least:

- Background.
- Surface.
- Elevated surface.
- Border.
- Primary accent.
- Secondary accent.
- Positive.
- Negative.
- Warning.
- Text.
- Muted text.

## Dashboard Customization Foundation

Module 1 should create the preference model for dashboard customization, but it does not need full drag-and-drop.

Required for now:

- Save which blocks are enabled.
- Use a default order.
- Future modules can add reorder and block sizing.

Potential dashboard blocks:

- Saldo.
- Receitas.
- Despesas.
- Faturas.
- Pendências.
- Gráfico de saldo.
- Gráfico de barras.
- Categorias.
- Alertas.
- Saúde financeira.
- Últimos lançamentos.
- Timeline de eventos.
- Metas/reservas.

## Animation Direction

Use premium motion with visible but controlled movement.

Required:

- Sidebar expand/collapse animation.
- Profile toggle microinteraction.
- Button hover/press states.
- Cards entering with subtle stagger.
- Page/content transitions that do not block usage.
- Skeleton loading instead of abrupt blank states where loading is visible.

Avoid:

- Constant motion.
- Long transitions.
- Excessive glow.
- Futuristic/game-like effects.

## Page Responsibilities In Module 1

Dashboard:

- May reuse existing dashboard data underneath.
- Must use new shell and profile context.
- Full premium dashboard content belongs to Module 2.

Lançamentos:

- May reuse existing transactions data underneath.
- Should enter via `/lancamentos`.
- Full editable premium table/feed belongs to Module 3.

Faturas:

- Create route and premium empty/placeholder state.
- Must respect active profile.
- Full credit-card/fatura integration belongs to Module 4.

Configurações:

- Must include subtab structure.
- Must include functioning Appearance section.
- Other settings sections can be simple but organized placeholders if needed.

## Out Of Scope

- Full premium dashboard redesign.
- Editable transactions side panel or bottom sheet.
- Full faturas integration and bill details.
- Category management redesign.
- Banco MCP connector management redesign.
- Drag-and-drop dashboard layout.
- Marketing, Facebook Ads, Utmify-like tracking, offers, creatives, checkout.

## Acceptance Criteria

- Authenticated app uses the new dark premium shell.
- Sidebar has only Dashboard, Lançamentos, Faturas, Configurações, Sair.
- Active profile selector appears at the top and switches profile context.
- New routes exist and old routes redirect.
- Appearance settings can change mode, palette, sidebar preference, hide values, default period, and default profile.
- Preferences persist across refreshes.
- Desktop and mobile layouts are intentionally different.
- Typecheck, lint, tests, and build pass.
- No secrets, tokens, real CSVs, or sensitive values are committed.
