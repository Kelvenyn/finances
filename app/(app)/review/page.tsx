import { updateTransactionCategory } from "@/app/(app)/review/actions";
import { brl, formatDate, profileLabel } from "@/lib/format";
import { listCategories, listTransactions } from "@/lib/data/finance";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const [transactions, categories] = await Promise.all([
    listTransactions({ needsReview: true }),
    listCategories(),
  ]);
  const groups = [
    { profile: "personal" as const, title: "Pessoal", items: transactions.filter((transaction) => transaction.profile === "personal") },
    { profile: "business" as const, title: "Empresarial", items: transactions.filter((transaction) => transaction.profile === "business") },
  ];

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">Revisao</span>
        <h1>Categorize o que ficou pendente.</h1>
        <p>Esses lancamentos melhoram seus relatorios assim que recebem uma categoria.</p>
      </header>

      <section className="review-list">
        {transactions.length ? (
          groups.map((group) =>
            group.items.length ? (
              <div className="review-group" key={group.profile}>
                <h2>{group.title}</h2>
                {group.items.map((transaction) => {
                  const options = categories.filter((category) => category.profile === transaction.profile && category.flow === transaction.flow);
                  return (
                    <article className="review-card" key={transaction.id}>
                      <div>
                        <span className="eyebrow">{profileLabel(transaction.profile)}</span>
                        <h2>{transaction.description}</h2>
                        <p>
                          {formatDate(transaction.date)} - {transaction.accounts?.name ?? "Sem conta"} - {brl.format(Number(transaction.amount))}
                        </p>
                      </div>
                      <form action={updateTransactionCategory}>
                        <input type="hidden" name="transactionId" value={transaction.id} />
                        <select name="categoryId" required defaultValue="">
                          <option value="" disabled>
                            Escolha a categoria
                          </option>
                          {options.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <button type="submit">Salvar</button>
                      </form>
                    </article>
                  );
                })}
              </div>
            ) : null,
          )
        ) : (
          <div className="panel empty-state">
            <strong>Nada para revisar.</strong>
            <p>Quando existirem lancamentos sem categoria, eles aparecem aqui.</p>
          </div>
        )}
      </section>
    </>
  );
}
