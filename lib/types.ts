export type ProfileType = "personal" | "business";
export type FlowType = "income" | "expense" | "investment";
export type AccountType = "bank" | "credit" | "wallet" | "other";
export type SourceType = "csv" | "banco_mcp" | "manual";

export interface Account {
  id: string;
  profile: ProfileType;
  name: string;
  institution: string;
  type: AccountType;
  external_id: string | null;
  current_balance: number | null;
  status: "connected" | "disconnected" | "pending";
  created_at: string;
}

export interface Category {
  id: string;
  profile: ProfileType;
  name: string;
  slug: string;
  flow: FlowType;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  profile: ProfileType;
  account_id: string | null;
  external_id: string | null;
  source: SourceType;
  date: string;
  description: string;
  amount: number;
  flow: FlowType;
  category_id: string | null;
  status: string;
  needs_review: boolean;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  accounts?: Pick<Account, "name" | "institution" | "type"> | null;
  categories?: Pick<Category, "name" | "color"> | null;
}

export interface DashboardSummary {
  income: number;
  expense: number;
  investment: number;
  net: number;
  reviewCount: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  byCategory: Array<{ name: string; color: string; amount: number }>;
}
