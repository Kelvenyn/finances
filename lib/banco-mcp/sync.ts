import { createAdminClient } from "@/lib/supabase/admin";
import { BancoTransaction, listTransactions } from "./client";

const ACCOUNTS = [
  { id: "7d967ed0-9a1b-41e9-946f-b480a701b700", bank: "99pay", profile: "personal" },
  { id: "cb419926-a08d-4a7b-8e74-44553f4ae4a8", bank: "nubank", profile: "personal" },
  { id: "0fc9466f-e839-4527-8be2-025dd5427899", bank: "nubank", profile: "personal" },
  { id: "d64add96-77cc-4ec1-ade2-81aa3a15203b", bank: "infinitepay", profile: "business" },
  { id: "49d570b1-8176-4583-8fb2-76a5faf5bc45", bank: "itau", profile: "personal" },
  { id: "0c0f58b0-b470-44bd-bc29-e2ead894c4d9", bank: "itau", profile: "personal" },
] as const;

// O CSV é a fonte oficial do histórico pessoal até 17/05/2026.
const PERSONAL_BANK_START = "2026-05-18";

function txDate(tx: BancoTransaction) {
  return String(tx.date ?? tx.transactionDate ?? new Date().toISOString()).slice(0, 10);
}

function txDescription(tx: BancoTransaction) {
  return String(tx.description ?? tx.merchant?.name ?? "Transação bancária").trim();
}

function txFlow(tx: BancoTransaction, amount: number) {
  const signal = `${tx.type ?? ""} ${tx.direction ?? ""}`.toLowerCase();
  if (/debit|expense|saida|despesa/.test(signal)) return "despesa";
  if (/credit|income|entrada|receita/.test(signal)) return "receita";
  return amount < 0 ? "despesa" : "receita";
}

export async function syncBancoMcp(backfill = false) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const fallbackFrom = backfill ? "2022-01-01" : new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const summary: Array<{ bank: string; account_id: string; fetched: number; error?: string }> = [];

  for (const account of ACCOUNTS) {
    try {
      const from = backfill && account.profile === "personal" ? PERSONAL_BANK_START : fallbackFrom;
      let page = 1;
      let fetched = 0;
      while (true) {
        const payload = await listTransactions(account.id, from, today, page);
        const transactions = payload.results ?? payload.transactions ?? [];
        if (!transactions.length) break;
        const rows = transactions.map((tx) => {
          const signedAmount = Number(tx.amount ?? 0);
          const description = txDescription(tx);
          return {
            external_id: String(tx.id ?? tx.transactionId ?? `${account.id}-${txDate(tx)}-${signedAmount}-${description}`),
            source: "banco_mcp",
            profile: account.profile,
            bank: account.bank,
            bank_account_id: account.id,
            date: txDate(tx),
            description,
            amount: Math.abs(signedAmount),
            flow: txFlow(tx, signedAmount),
            payment_method: String(tx.paymentMethod ?? tx.operationType ?? "outros").toLowerCase(),
            status: String(tx.status ?? "posted").toLowerCase(),
            category: tx.category ? String(tx.category) : null,
            needs_review: !tx.category,
            raw_data: tx,
          };
        });
        const { error } = await supabase.from("transactions").upsert(rows, { onConflict: "external_id" });
        if (error) throw error;
        fetched += rows.length;
        if (transactions.length < 500) break;
        page += 1;
      }
      await supabase.from("sync_log").insert({ bank: account.bank, account_id: account.id, last_tx_date: today, new_count: fetched, status: "ok" });
      summary.push({ bank: account.bank, account_id: account.id, fetched });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await supabase.from("sync_log").insert({ bank: account.bank, account_id: account.id, status: "error", error_msg: message });
      summary.push({ bank: account.bank, account_id: account.id, fetched: 0, error: message });
    }
  }
  return { ok: summary.every((item) => !item.error), total_fetched: summary.reduce((sum, item) => sum + item.fetched, 0), accounts: summary };
}
