const BASE_URL = "https://api.mcp.ai/api/openfinance";

export async function bancoMcpPost<T>(path: string, body: unknown = {}): Promise<T> {
  const key = process.env.BANCO_MCP_API_KEY;
  if (!key) throw new Error("BANCO_MCP_API_KEY não configurada.");

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { ok?: boolean; result?: T; error?: unknown } | null;
  if (!response.ok || !payload?.ok) {
    throw new Error(`Banco MCP (${response.status}): ${JSON.stringify(payload?.error ?? payload)}`);
  }
  return payload.result as T;
}

export interface BancoAccount {
  id: string;
  account_id?: string;
  type: "BANK" | "CREDIT";
  balance?: string | number;
  bank?: string;
  name?: string;
  creditData?: { creditLimit?: string; availableCreditLimit?: string };
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
  categoryId?: string;
  status?: string;
  paymentMethod?: string;
  operationType?: string;
  [key: string]: unknown;
}

export async function listAccounts() {
  return bancoMcpPost<{ results?: BancoAccount[]; accounts?: BancoAccount[] }>("/accounts/list");
}

export async function listTransactions(accountId: string, from: string, to: string, page: number) {
  return bancoMcpPost<{ results?: BancoTransaction[]; transactions?: BancoTransaction[]; total?: number }>(
    "/transactions/list",
    { account_id: accountId, from, to, page, page_size: 500 },
  );
}
