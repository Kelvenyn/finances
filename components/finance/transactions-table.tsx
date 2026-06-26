import { brl, flowLabel, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return (
      <div className="empty-state">
        <strong>Nenhuma movimentacao encontrada.</strong>
        <p>Quando o CSV for importado ou o Banco MCP sincronizar, os lancamentos aparecem aqui.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descricao</th>
            <th>Conta</th>
            <th>Fluxo</th>
            <th>Categoria</th>
            <th className="amount">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date)}</td>
              <td>
                <strong>{transaction.description}</strong>
                <small>{transaction.source}</small>
              </td>
              <td>{transaction.accounts?.name ?? transaction.accounts?.institution ?? "Sem conta"}</td>
              <td>
                <span className={`flow-pill ${transaction.flow}`}>{flowLabel(transaction.flow)}</span>
              </td>
              <td>{transaction.categories?.name ?? <span className="review-pill">Revisar</span>}</td>
              <td className={`amount ${transaction.flow}`}>{brl.format(Number(transaction.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
