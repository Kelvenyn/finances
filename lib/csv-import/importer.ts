import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
  }
}

function normalizeHeader(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
}

function parseDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) throw new Error(`Data inválida: ${value}`);
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function parseMoney(value: string) {
  const clean = value.replace(/R\$|\s/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const amount = Number(normalized.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(amount)) throw new Error(`Valor inválido: ${value}`);
  return amount;
}

function get(row: Record<string, string>, key: string) {
  const found = Object.keys(row).find((name) => normalizeHeader(name) === key);
  return found ? String(row[found] ?? "").trim() : "";
}

async function main() {
  loadLocalEnv();
  const filename = process.argv[2] ?? "dados antigos.csv";
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) throw new Error(`CSV não encontrado: ${path}`);
  const content = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const firstLine = content.split(/\r?\n/, 1)[0];
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const records = parse(content, { columns: true, delimiter, skip_empty_lines: true, relax_column_count: true, trim: true }) as Record<string, string>[];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Credenciais do Supabase ausentes em .env.local");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let imported = 0;
  for (let offset = 0; offset < records.length; offset += 250) {
    const rows = records.slice(offset, offset + 250).map((row, index) => {
      const rawAmount = parseMoney(get(row, "TOTAL R$") || get(row, "TOTAL") || "0");
      const rawFlow = get(row, "FLUXO").toLowerCase();
      const flow = /receita|entrada/.test(rawFlow) ? "receita" : /invest/.test(rawFlow) ? "investimento" : "despesa";
      const date = parseDate(get(row, "DATA"));
      const description = get(row, "DESCRICAO") || "Sem descrição";
      const identity = JSON.stringify([date, description, rawAmount, get(row, "CATEGORIAS"), offset + index]);
      return {
        external_id: `csv_${createHash("sha256").update(identity).digest("hex")}`,
        source: "csv_import",
        profile: "personal",
        bank: "historico",
        date,
        description,
        amount: Math.abs(rawAmount),
        flow,
        payment_method: get(row, "PAGAMENTO").toLowerCase() || "outros",
        status: get(row, "STATUS").toLowerCase() || "posted",
        category: get(row, "CATEGORIAS") || null,
        subcategory: get(row, "SUBCATEGORIAS") || null,
        tipo: get(row, "TIPO") || null,
        needs_review: !get(row, "CATEGORIAS"),
        raw_data: row,
      };
    });
    const { error } = await supabase.from("transactions").upsert(rows, { onConflict: "external_id", ignoreDuplicates: true });
    if (error) throw error;
    imported += rows.length;
    console.log(`Processadas ${Math.min(offset + rows.length, records.length)} de ${records.length}`);
  }
  console.log(`Importação concluída: ${imported} linhas processadas sem duplicar registros existentes.`);
}

main().catch((error) => { console.error(error); process.exit(1); });

