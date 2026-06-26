# AGENTS.md - Finance Core

Leia este arquivo antes de qualquer alteração. Atualize o estado ao fim de cada sessão relevante.

## Propósito

Plataforma single-user para Kelvenyn acompanhar finanças pessoais e empresariais separadamente. A fase atual é o Finance Core v1: movimentações, saldos, categorias, revisão, CSV histórico e Banco MCP/Open Finance.

## Stack

- Next.js App Router, TypeScript e Tailwind CSS
- Supabase Auth e PostgreSQL
- Banco MCP como fonte Open Finance a validar em ambiente real
- Vercel para deploy

## Regras

- Nunca commitar chaves, tokens ou CSVs reais.
- Pessoal e empresarial não devem ser misturados nas telas.
- Começar com caixa prático, sem contabilidade por competência.
- Tracking, Facebook Ads, ofertas e criativos ficam fora da v1 financeira.

## Estado atual

- Base Finance Core v1 recriada do zero.
- Login por e-mail/senha funcionando via Supabase.
- Schema Supabase versionado em `supabase/migrations/001_finance_core.sql`.
- Hardening de RLS/integridade versionado em `supabase/migrations/002_security_and_integrity.sql`.
- Documentação viva criada em `docs/product`.
- Banco MCP validado com credenciais reais e conta InfinitePay classificada como empresarial via `BANCO_MCP_BUSINESS_ACCOUNT_IDS`.
- CSV pessoal `Finanças - Pessoal - KELVENYN.csv` importado em 26/06/2026: 3.495 lançamentos, todos no perfil pessoal.
- Validação local em 26/06/2026: `npm run typecheck`, `npm run lint` e `npm run build` passaram.
- Próxima etapa pessoal/desktop documentada em `docs/superpowers/specs/2026-06-26-personal-dashboard-sync-design.md`.
- Plano da etapa pessoal/desktop criado em `docs/superpowers/plans/2026-06-26-personal-dashboard-sync.md`.
- Painel pessoal em implementação: botão `Atualizar agora`, cards pessoais, gráfico de saldo de 90 dias e filtros expandidos de movimentações.

## Próximos passos

1. Aplicar `supabase/migrations/002_security_and_integrity.sql` no Supabase.
2. Validar visualmente o painel pessoal em desktop.
3. Revisar categorias importadas do CSV e ajustar nomes/agrupamentos.
4. Validar o que Banco MCP entrega sobre cartão/faturas antes de implementar a aba de crédito.
