import { TransactionTable } from "@/components/transactions/table";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("needs_review", true).order("date", { ascending: false }).limit(500);
  return <><span className="eyebrow">Organização</span><h1>Fila de revisão</h1><p className="lead">Movimentações sem categoria confiável aparecem aqui.</p>{error ? <div className="error">{error.message}</div> : <section className="panel transactions-panel review-list"><div className="section-head"><div><span className="section-kicker">Pendências</span><h2>Precisam da sua atenção</h2></div><span className="attention-count">{data?.length ?? 0}</span></div><TransactionTable transactions={(data ?? []) as Transaction[]} /></section>}</>;
}

