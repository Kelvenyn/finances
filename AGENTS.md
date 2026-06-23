# AGENTS.md — FinanceHub

Leia este arquivo antes de qualquer alteração. Atualize **Estado atual** ao fim de cada sessão.

## Propósito

Aplicativo responsivo para consolidar finanças pessoais e empresariais de Kelvenyn, usando dados bancários do Banco MCP e o histórico categorizado da planilha antiga.

## Stack real

- Next.js 16.2.9, App Router, TypeScript e Tailwind CSS 4
- Supabase (PostgreSQL), projeto `xwwgrbtdbklwxcrlesxg`
- Banco MCP REST API / Open Finance
- Deploy planejado na Vercel

As credenciais ficam somente em `.env.local`, que está ignorado pelo Git. Nunca copie seus valores para documentação ou commits.

## Contas conectadas

| Banco | Perfil | Account ID |
|---|---|---|
| 99Pay | pessoal | `7d967ed0-9a1b-41e9-946f-b480a701b700` |
| Nubank conta | pessoal | `cb419926-a08d-4a7b-8e74-44553f4ae4a8` |
| Nubank cartão | pessoal | `0fc9466f-e839-4527-8be2-025dd5427899` |
| InfinitePay | empresa | `d64add96-77cc-4ec1-ade2-81aa3a15203b` |
| Itaú conta | pessoal | `49d570b1-8176-4583-8fb2-76a5faf5bc45` |
| Itaú cartão | pessoal | `0c0f58b0-b470-44bd-bc29-e2ead894c4d9` |

## Regra das fontes de dados

- `csv_import`: fonte oficial do perfil pessoal entre 01/01/2022 e 17/05/2026, preservando categorias manuais.
- `banco_mcp`: perfil pessoal a partir de 18/05/2026.
- `banco_mcp`: todo o histórico disponível da InfinitePay empresarial.
- A regra está em `lib/banco-mcp/sync.ts` e evita contagem duplicada no período sobreposto.

## Comandos

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npx.cmd tsx lib/csv-import/importer.ts "dados antigos.csv"
```

O endpoint `POST /api/sync/run` exige o cabeçalho `x-cron-secret`. Use `?backfill=true` apenas para recarregar todo o período permitido pela regra acima.

## Estado atual — 23/06/2026

Concluído:

- [x] Projeto reconstruído após perda dos arquivos pelo OneDrive
- [x] Migration aplicada no Supabase: `transactions`, `categories`, `sync_log`, `push_subscriptions`
- [x] 30 categorias cadastradas
- [x] CSV importado: 3.495 transações pessoais (2022-01-01 a 2026-05-17)
- [x] Banco MCP sincronizado: 4.658 transações visíveis após remover sobreposição pessoal
- [x] Total consolidado atual: 8.153 transações
- [x] Dashboard, transações, filtros e fila de revisão respondendo com HTTP 200
- [x] TypeScript, ESLint e build de produção sem erros

Pendente:

- [ ] Publicar na Vercel e configurar as variáveis de ambiente
- [ ] Configurar execução automática do sync
- [ ] Implementar autenticação antes de tornar a URL pública
- [ ] Implementar edição de categoria na fila de revisão
- [ ] Implementar Web Push completo (o service worker básico já existe)
- [ ] Rotacionar as chaves compartilhadas no chat e atualizar `.env.local`

