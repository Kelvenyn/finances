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

  try {
    const result = await syncBancoMcp(backfill);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
