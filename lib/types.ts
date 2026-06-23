export type Profile = "personal" | "business";
export type Flow = "receita" | "despesa" | "investimento";

export interface Transaction {
  id: string;
  external_id: string | null;
  source: string;
  profile: Profile;
  bank: string;
  bank_account_id: string | null;
  date: string;
  description: string;
  amount: number;
  flow: Flow;
  payment_method: string | null;
  status: string;
  category: string | null;
  subcategory: string | null;
  tipo: string | null;
  needs_review: boolean;
}

