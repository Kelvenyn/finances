import { brl, shortDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return <div className="card empty">Nenhuma transação encontrada.</div>;
  return <div className="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Banco</th><th className="amount">Valor</th></tr></thead>
    <tbody>{transactions.map((tx) => <tr key={tx.id}>
      <td>{shortDate(tx.date)}</td><td>{tx.description}</td><td><span className="badge">{tx.category || "Revisar"}</span></td><td>{tx.bank}</td>
      <td className={`amount ${tx.flow === "receita" ? "positive" : "negative"}`}>{tx.flow === "receita" ? "+ " : "− "}{brl.format(Number(tx.amount))}</td>
    </tr>)}</tbody></table></div>;
}

