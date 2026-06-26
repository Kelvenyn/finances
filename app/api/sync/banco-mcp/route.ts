import { NextResponse } from "next/server";
import { syncBancoMcp } from "@/lib/banco-mcp/sync";

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET;
  const received = request.headers.get("x-sync-secret");

  if (!secret || received !== secret) {
    return NextResponse.json({ ok: false, error: "Nao autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const backfill = url.searchParams.get("backfill") === "true";
  if (backfill && process.env.NODE_ENV === "production" && process.env.ALLOW_BACKFILL_SYNC !== "true") {
    return NextResponse.json({ ok: false, error: "Backfill bloqueado em producao." }, { status: 403 });
  }

  try {
    const result = await syncBancoMcp(backfill);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Banco MCP sync failed", message);
    return NextResponse.json({ ok: false, error: "Falha ao sincronizar Banco MCP." }, { status: 500 });
  }
}
