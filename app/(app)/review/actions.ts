"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateTransactionCategory(formData: FormData) {
  const transactionId = String(formData.get("transactionId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!transactionId || !categoryId) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("transactions")
    .update({ category_id: categoryId, needs_review: false, reviewed_at: new Date().toISOString() })
    .eq("id", transactionId);

  revalidatePath("/review");
  revalidatePath("/transactions");
  revalidatePath("/personal");
  revalidatePath("/business");
}
