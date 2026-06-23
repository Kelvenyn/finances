import { NextRequest, NextResponse } from "next/server";
import { syncBancoMcp } from "@/lib/banco-mcp/sync";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }
  const backfill = request.nextUrl.searchParams.get("backfill") === "true";
  return NextResponse.json(await syncBancoMcp(backfill));
}

