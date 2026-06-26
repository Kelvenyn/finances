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
- Login por e-mail/senha planejado via Supabase.
- Schema Supabase versionado em `supabase/migrations/001_finance_core.sql`.
- Documentação viva criada em `docs/product`.

## Próximos passos

1. Configurar variáveis de ambiente locais e na Vercel.
2. Aplicar a migration no Supabase.
3. Criar o usuário do Kelvenyn no Supabase Auth.
4. Validar Banco MCP com credenciais reais.
5. Importar o CSV antigo após confirmar colunas.
