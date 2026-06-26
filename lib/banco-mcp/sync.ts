import { createAdminClient } from "@/lib/supabase/admin";
import type { FlowType, ProfileType } from "@/lib/types";
import {
  fetchBancoAccounts,
  fetchBancoConnections,
  fetchBancoTransactions,
  type BancoAccount,
  type BancoConnection,
  type BancoTransaction,
} from "./client";

function accountExternalId(account: BancoAccount) {
  const id = account.account_id ?? account.id;
  if (!id) throw new Error("Conta Banco MCP sem identificador.");
  return String(id);
}

function accountProfile(externalId: string): ProfileType {
  const businessIds = new Set((process.env.BANCO_MCP_BUSINESS_ACCOUNT_IDS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  return businessIds.has(externalId) ? "business" : "personal";
}

function connectionName(connection: BancoConnection) {
  return String(connection.connector_name ?? connection.connector_id ?? "Banco MCP");
}

function connectionSelector(connection: BancoConnection) {
  return String(connection.item_id ?? connection.connector_id ?? connection.connector_name ?? "");
}

function accountType(account: BancoAccount) {
  const value = String(account.type ?? "").toLowerCase();
  if (value.includes("credit")) return "credit";
  if (value.includes("wallet")) return "wallet";
  if (value.includes("bank") || value.includes("checking")) return "bank";
  return "other";
}

function parseAmount(value: unknown) {
  const amount = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(amount) ? amount : 0;
}

function transactionDate(transaction: BancoTransaction) {
  return String(transaction.date ?? transaction.transactionDate ?? new Date().toISOString()).slice(0, 10);
}

function transactionDescription(transaction: BancoTransaction) {
  return String(transaction.description ?? transaction.merchant?.name ?? "Movimentacao bancaria").trim();
}

function transactionFlow(transaction: BancoTransaction, signedAmount: number): FlowType {
  const signal = `${transaction.type ?? ""} ${transaction.direction ?? ""}`.toLowerCase();
  if (/debit|expense|saida|despesa|outflow/.test(signal)) return "expense";
  if (/credit|income|entrada|receita|inflow/.test(signal)) return "income";
  return signedAmount < 0 ? "expense" : "income";
}

export async function syncBancoMcp(backfill = false) {
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const from = backfill ? "2022-01-01" : new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

  const syncRun = await supabase
    .from("sync_runs")
    .insert({ source: "banco_mcp", status: "running", started_at: startedAt })
    .select("id")
    .single();

  if (syncRun.error) throw syncRun.error;

  let totalAccounts = 0;
  let totalTransactions = 0;

  try {
    const connectionsPayload = await fetchBancoConnections();
    const connections = connectionsPayload.connections ?? [];

    for (const connection of connections) {
      const selector = connectionSelector(connection);
      if (!selector) continue;

      const accountsPayload = await fetchBancoAccounts(selector);
      const accounts = accountsPayload.results ?? accountsPayload.accounts ?? [];
      totalAccounts += accounts.length;

      for (const account of accounts) {
        const externalId = accountExternalId(account);
        const profile = accountProfile(externalId);
        const institution = String(account.bank ?? account.institution ?? accountsPayload.bank ?? connectionName(connection));
        const name = String(account.name ?? institution);

        const accountUpsert = await supabase
          .from("accounts")
          .upsert(
            {
              profile,
              name,
              institution,
              type: accountType(account),
              external_id: externalId,
              current_balance: parseAmount(account.balance ?? account.currentBalance),
              status: String(connection.status ?? account.status ?? "connected").toLowerCase(),
              raw_data: { connection, account },
            },
            { onConflict: "external_id" },
          )
          .select("id")
          .single();

        if (accountUpsert.error) throw accountUpsert.error;

        let page = 1;
        while (true) {
          const payload = await fetchBancoTransactions(externalId, from, today, page);
          const transactions = payload.results ?? payload.transactions ?? [];
          if (!transactions.length) break;

          const rows = transactions.map((transaction) => {
            const signedAmount = parseAmount(transaction.amount);
            const description = transactionDescription(transaction);
            const date = transactionDate(transaction);
            const fallbackId = `${externalId}:${date}:${signedAmount}:${description}`;

            return {
              profile,
              account_id: accountUpsert.data.id,
              external_id: String(transaction.id ?? transaction.transactionId ?? fallbackId),
              source: "banco_mcp",
              date,
              description,
              amount: Math.abs(signedAmount),
              flow: transactionFlow(transaction, signedAmount),
              status: String(transaction.status ?? "posted").toLowerCase(),
              needs_review: !transaction.category,
              raw_data: transaction,
            };
          });

          const result = await supabase.from("transactions").upsert(rows, { onConflict: "source,external_id" });
          if (result.error) throw result.error;

          totalTransactions += rows.length;
          if (transactions.length < 500) break;
          page += 1;
        }
      }
    }

    await supabase
      .from("sync_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        accounts_count: totalAccounts,
        transactions_count: totalTransactions,
      })
      .eq("id", syncRun.data.id);

    return { ok: true, accounts: totalAccounts, transactions: totalTransactions };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from("sync_runs")
      .update({ status: "error", finished_at: new Date().toISOString(), error_message: message })
      .eq("id", syncRun.data.id);
    throw error;
  }
}
