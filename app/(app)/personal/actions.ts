"use server";

import { revalidatePath } from "next/cache";
import { syncBancoMcp } from "@/lib/banco-mcp/sync";

export type SyncActionState = {
  status: "idle" | "success" | "error";
  message: string;
  syncedAt: string | null;
};

export async function syncPersonalNow(): Promise<SyncActionState> {
  try {
    const result = await syncBancoMcp(false);

    revalidatePath("/personal");
    revalidatePath("/review");
    revalidatePath("/transactions");
    revalidatePath("/settings");

    return {
      status: "success",
      message: `${result.transactions} lancamentos verificados em ${result.accounts} contas.`,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Personal sync failed", error);
    return {
      status: "error",
      message: "Nao foi possivel atualizar agora. Tente novamente em alguns minutos.",
      syncedAt: null,
    };
  }
}
