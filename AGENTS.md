# AGENTS.md - Finance Core

Leia este arquivo antes de qualquer alteracao. Atualize o estado ao fim de cada sessao relevante.

## Proposito

Plataforma single-user para Kelvenyn acompanhar financas pessoais e empresariais separadamente. A fase atual e o Finance Core v1: movimentacoes, saldos, categorias, revisao, CSV historico e Banco MCP/Open Finance.

## Stack

- Next.js App Router, TypeScript e Tailwind CSS
- Supabase Auth e PostgreSQL
- Banco MCP como fonte Open Finance a validar em ambiente real
- Vercel para deploy

## Regras

- Nunca commitar chaves, tokens ou CSVs reais.
- Pessoal e empresarial nao devem ser misturados nas telas.
- Comecar com caixa pratico, sem contabilidade por competencia.
- Tracking, Facebook Ads, ofertas e criativos ficam fora da v1 financeira.

## Estado atual

- Base Finance Core v1 recriada do zero.
- Login por e-mail/senha funcionando via Supabase.
- Schema Supabase versionado em `supabase/migrations/001_finance_core.sql`.
- Hardening de RLS/integridade versionado em `supabase/migrations/002_security_and_integrity.sql`.
- Documentacao viva criada em `docs/product`.
- Banco MCP validado com credenciais reais e conta InfinitePay classificada como empresarial via `BANCO_MCP_BUSINESS_ACCOUNT_IDS`.
- CSV pessoal `Financas - Pessoal - KELVENYN.csv` importado em 26/06/2026: 3.495 lancamentos, todos no perfil pessoal.
- Etapa pessoal/desktop documentada em `docs/superpowers/specs/2026-06-26-personal-dashboard-sync-design.md`.
- Plano da etapa pessoal/desktop criado em `docs/superpowers/plans/2026-06-26-personal-dashboard-sync.md`.
- Premium Shell Module 1 spec salvo em `docs/superpowers/specs/2026-06-26-premium-shell-redesign-module-1.md`.
- Premium Shell Module 1 plan salvo em `docs/superpowers/plans/2026-06-26-premium-shell-redesign-module-1.md`.
- Novas rotas alvo: `/dashboard`, `/lancamentos`, `/faturas`, `/configuracoes`.
- Sidebar v1 deve conter apenas Dashboard, Lancamentos, Faturas, Configuracoes e Sair.
- Alternancia Pessoal/Empresarial acontece no topo por seletor de perfil, nao por dois itens na sidebar.

## Proximos passos

1. Validar visualmente o Premium Shell Module 1 em desktop e mobile.
2. Revisar categorias importadas do CSV e ajustar nomes/agrupamentos.
3. Validar o que Banco MCP entrega sobre cartao/faturas antes de implementar a aba de credito.
4. Iniciar Module 2: dashboard premium com cards, graficos e ultimos lancamentos refinados.
