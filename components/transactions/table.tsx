import { brl, shortDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return <div className="empty-state"><span>⌕</span><strong>Nenhuma transação encontrada</strong><p>Tente alterar os filtros da busca.</p></div>;
  return <div className="table-wrap"><table><thead><tr><th>Movimentação</th><th>Categoria</th><th>Banco</th><th className="amount">Valor</th></tr></thead>
    <tbody>{transactions.map((tx) => <tr key={tx.id}>
      <td><div className="transaction-main"><span className={`flow-icon ${tx.flow}`}>{tx.flow === "receita" ? "↙" : tx.flow === "investimento" ? "◇" : "↗"}</span><span><strong>{tx.description}</strong><small>{shortDate(tx.date)} · {tx.profile === "business" ? "Empresa" : "Pessoal"}</small></span></div></td>
      <td><span className={`category-pill ${tx.needs_review ? "review" : ""}`}>{tx.category || "Revisar"}</span></td>
      <td><span className={`bank-chip bank-${tx.bank.toLowerCase()}`}><i>{bankInitial(tx.bank)}</i>{bankLabel(tx.bank)}</span></td>
      <td className={`amount ${tx.flow === "receita" ? "positive" : tx.flow === "despesa" ? "negative" : "investment"}`}>{tx.flow === "receita" ? "+ " : tx.flow === "despesa" ? "− " : ""}{brl.format(Number(tx.amount))}</td>
    </tr>)}</tbody></table></div>;
}

function bankInitial(bank: string) { if (bank.toLowerCase().includes("infinite")) return "IP"; if (bank.toLowerCase().includes("nubank")) return "NU"; if (bank.toLowerCase().includes("itau")) return "IT"; return "99"; }
function bankLabel(bank: string) { if (bank.toLowerCase().includes("infinite")) return "InfinitePay"; if (bank.toLowerCase().includes("nubank")) return "Nubank"; if (bank.toLowerCase().includes("itau")) return "Itaú"; return "99Pay"; }

