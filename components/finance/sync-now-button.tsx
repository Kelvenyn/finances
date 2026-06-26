"use client";

import { useTransition, useState } from "react";
import type { SyncActionState } from "@/app/(app)/personal/actions";

export function SyncNowButton({ action }: { action: () => Promise<SyncActionState> }) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SyncActionState>({ status: "idle", message: "", syncedAt: null });

  return (
    <div className="sync-control">
      <button
        type="button"
        className="primary-action"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const result = await action();
            setState(result);
          });
        }}
      >
        {isPending ? "Atualizando..." : "Atualizar agora"}
      </button>
      {state.status !== "idle" ? <span className={`sync-message ${state.status}`}>{state.message}</span> : null}
    </div>
  );
}
