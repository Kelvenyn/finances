import { TransactionTable } from "@/components/transactions/table";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ profile?: string; flow?: string; q?: string }> }) {
  const params = await searchParams;
  const supabase = createAdminClient();
  let query = supabase.from("transactions").select("*").order("date", { ascending: false }).limit(500);
  if (params.profile) query = query.eq("profile", params.profile);
  if (params.flow) query = query.eq("flow", params.flow);
  if (params.q) query = query.ilike("description", `%${params.q}%`);
  const { data, error } = await query;
  return <><h1>Transações</h1><p className="lead">Pesquise e filtre suas movimentações consolidadas.</p>
    <form className="filters"><input name="q" defaultValue={params.q} placeholder="Buscar descrição"/><select name="profile" defaultValue={params.profile ?? ""}><option value="">Todos os perfis</option><option value="personal">Pessoal</option><option value="business">Empresa</option></select><select name="flow" defaultValue={params.flow ?? ""}><option value="">Todos os fluxos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option><option value="investimento">Investimentos</option></select><button type="submit">Filtrar</button></form>
    {error ? <div className="error">{error.message}</div> : <TransactionTable transactions={(data ?? []) as Transaction[]} />}</>;
}

