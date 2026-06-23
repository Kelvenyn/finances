import { TransactionTable } from "@/components/transactions/table";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("needs_review", true).order("date", { ascending: false }).limit(500);
  return <><h1>Fila de revisão</h1><p className="lead">Movimentações sem categoria confiável aparecem aqui.</p>{error ? <div className="error">{error.message}</div> : <TransactionTable transactions={(data ?? []) as Transaction[]} />}</>;
}

