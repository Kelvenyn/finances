import { requireEnv } from "@/lib/supabase/env";

const DEFAULT_BASE_URL = "https://api.mcp.ai/api/openfinance";

export interface BancoAccount {
  id?: string;
  account_id?: string;
  name?: string;
  bank?: string;
  institution?: string;
  type?: string;
  balance?: string | number | null;
  currentBalance?: string | number | null;
  status?: string;
  [key: string]: unknown;
}

export interface BancoTransaction {
  id?: string;
  transactionId?: string;
  date?: string;
  transactionDate?: string;
  description?: string;
  merchant?: { name?: string };
  amount?: string | number;
  type?: string;
  direction?: string;
  category?: string;
  status?: string;
  paymentMethod?: string;
  operationType?: string;
  [key: string]: unknown;
}

async function bancoMcpPost<T>(path: string, body: unknown = {}) {
  const baseUrl = process.env.BANCO_MCP_BASE_URL ?? DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("BANCO_MCP_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { ok?: boolean; result?: T; error?: unknown } | T | null;
  if (!response.ok) throw new Error(`Banco MCP HTTP ${response.status}: ${JSON.stringify(payload)}`);
  if (payload && typeof payload === "object" && "ok" in payload && payload.ok === false) {
    throw new Error(`Banco MCP: ${JSON.stringify(payload.error)}`);
  }

  return (payload && typeof payload === "object" && "result" in payload ? payload.result : payload) as T;
}

export async function fetchBancoAccounts() {
  return bancoMcpPost<{ results?: BancoAccount[]; accounts?: BancoAccount[] }>("/accounts/list");
}

export async function fetchBancoTransactions(accountId: string, from: string, to: string, page = 1) {
  return bancoMcpPost<{ results?: BancoTransaction[]; transactions?: BancoTransaction[]; total?: number }>(
    "/transactions/list",
    { account_id: accountId, from, to, page, page_size: 500 },
  );
}
