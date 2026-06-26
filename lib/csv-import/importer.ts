import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import type { FlowType, ProfileType } from "@/lib/types";

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function get(row: Record<string, string>, candidates: string[]) {
  const keys = Object.keys(row);
  const found = keys.find((key) => candidates.includes(normalize(key)));
  return found ? String(row[found] ?? "").trim() : "";
}

function parseDate(value: string) {
  const clean = value.trim();
  const br = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  const iso = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  throw new Error(`Data invalida: ${value}`);
}

function parseMoney(value: string) {
  const cleaned = value.replace(/R\$|\s/g, "");
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  const amount = Number(normalized.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(amount)) throw new Error(`Valor invalido: ${value}`);
  return amount;
}

function parseFlow(row: Record<string, string>, amount: number): FlowType {
  const raw = normalize(get(row, ["fluxo", "tipo", "type", "flow"]));
  if (/receita|entrada|income|credit/.test(raw)) return "income";
  if (/invest/.test(raw)) return "investment";
  if (/despesa|saida|expense|debit/.test(raw)) return "expense";
  return amount < 0 ? "expense" : "income";
}

function parseProfile(row: Record<string, string>): ProfileType {
  const raw = normalize(get(row, ["perfil", "profile", "contexto"]));
  if (/empresa|business|pj/.test(raw)) return "business";
  if (/pessoal|personal|pf/.test(raw)) return "personal";
  return process.env.CSV_DEFAULT_PROFILE === "business" ? "business" : "personal";
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "sem-categoria";
}

async function main() {
  loadLocalEnv();

  const filename = process.argv[2];
  if (!filename) throw new Error('Informe o arquivo CSV: npm run import:csv -- "dados.csv"');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Credenciais do Supabase ausentes em .env.local");

  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) throw new Error(`CSV nao encontrado: ${path}`);

  const content = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const firstLine = content.split(/\r?\n/, 1)[0];
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const records = parse(content, { columns: true, delimiter, skip_empty_lines: true, relax_column_count: true, trim: true }) as Record<string, string>[];
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const batch = await supabase
    .from("import_batches")
    .insert({ source: "csv", file_name: basename(path), status: "running", total_rows: records.length })
    .select("id")
    .single();
  if (batch.error) throw batch.error;

  const account = await supabase
    .from("accounts")
    .upsert(
      {
        profile: process.env.CSV_DEFAULT_PROFILE === "business" ? "business" : "personal",
        name: "Historico CSV",
        institution: "Planilha",
        type: "other",
        external_id: "csv-history",
        status: "connected",
      },
      { onConflict: "external_id" },
    )
    .select("id")
    .single();
  if (account.error) throw account.error;

  try {
    let imported = 0;

    for (let offset = 0; offset < records.length; offset += 250) {
      const slice = records.slice(offset, offset + 250);
      const rows = [];

      for (const row of slice) {
        const rawAmount = parseMoney(get(row, ["valor", "total", "total r$", "amount"]) || "0");
        const profile = parseProfile(row);
        const flow = parseFlow(row, rawAmount);
        const date = parseDate(get(row, ["data", "date"]));
        const description = get(row, ["descricao", "descrição", "description", "lancamento", "lançamento"]) || "Sem descricao";
        const categoryName = get(row, ["categoria", "categorias", "category"]);
        let categoryId = null;

        if (categoryName) {
          const category = await supabase
            .from("categories")
            .upsert(
              { profile, name: categoryName, slug: `${profile}-${slugify(categoryName)}`, flow, color: "#64748b" },
              { onConflict: "slug" },
            )
            .select("id")
            .single();
          if (category.error) throw category.error;
          categoryId = category.data.id;
        }

        const identity = JSON.stringify([profile, date, description, rawAmount, categoryName, flow]);
        rows.push({
          profile,
          account_id: account.data.id,
          external_id: createHash("sha256").update(identity).digest("hex"),
          source: "csv",
          date,
          description,
          amount: Math.abs(rawAmount),
          flow,
          category_id: categoryId,
          status: "posted",
          needs_review: !categoryId,
          import_batch_id: batch.data.id,
          raw_data: row,
        });
      }

      const result = await supabase.from("transactions").upsert(rows, { onConflict: "source,external_id" });
      if (result.error) throw result.error;
      imported += rows.length;
      console.log(`Processadas ${imported} de ${records.length}`);
    }

    await supabase
      .from("import_batches")
      .update({ status: "success", imported_rows: imported, finished_at: new Date().toISOString() })
      .eq("id", batch.data.id);

    console.log(`Importacao concluida: ${imported} linhas processadas.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from("import_batches")
      .update({ status: "error", error_message: message, finished_at: new Date().toISOString() })
      .eq("id", batch.data.id);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
