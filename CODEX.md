# CODEX.md — Continuação

Leia `AGENTS.md`; ele contém o estado real e as decisões atuais.

Não rode novamente a migration nem importe o CSV sem necessidade. Ambos os processos são idempotentes, mas já foram concluídos.

Próxima etapa recomendada:

1. Implementar autenticação Supabase para proteger todas as páginas.
2. Implementar edição de categorias em `/review`.
3. Publicar na Vercel, cadastrar as variáveis de `.env.local` no ambiente e configurar o cron de sincronização.
4. Rotacionar as chaves que foram compartilhadas em conversa e substituir somente em `.env.local` e na Vercel.

Validação registrada em 23/06/2026:

- `npm.cmd run typecheck`: passou
- `npm.cmd run lint`: passou
- `npm.cmd run build`: passou
- `/`, `/transactions`, `/review`: HTTP 200
- Supabase: 8.153 transações consolidadas

