export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: string) {
  return shortDate.format(new Date(`${value}T00:00:00.000Z`));
}

export function profileLabel(profile: "personal" | "business") {
  return profile === "personal" ? "Pessoal" : "Empresarial";
}

export function flowLabel(flow: "income" | "expense" | "investment") {
  if (flow === "income") return "Receita";
  if (flow === "expense") return "Despesa";
  return "Investimento";
}
