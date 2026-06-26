"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateTransactionCategory(formData: FormData) {
  const transactionId = String(formData.get("transactionId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!transactionId || !categoryId) return;

  const supabase = await createServerSupabaseClient();

  const [{ data: transaction, error: transactionError }, { data: category, error: categoryError }] = await Promise.all([
    supabase.from("transactions").select("id, profile, flow").eq("id", transactionId).single(),
    supabase.from("categories").select("id, profile, flow").eq("id", categoryId).single(),
  ]);

  if (transactionError) throw transactionError;
  if (categoryError) throw categoryError;
  if (!transaction || !category || transaction.profile !== category.profile || transaction.flow !== category.flow) {
    throw new Error("Categoria incompativel com este lancamento.");
  }

  const { error } = await supabase
    .from("transactions")
    .update({ category_id: categoryId, needs_review: false, reviewed_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/review");
  revalidatePath("/transactions");
  revalidatePath("/personal");
  revalidatePath("/business");
}
