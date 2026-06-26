import { brl, formatDate } from "@/lib/format";
import type { BalancePoint } from "@/lib/data/personal-dashboard";

function pathFromPoints(points: BalancePoint[], width: number, height: number, padding: number) {
  if (!points.length) return "";

  const balances = points.map((point) => point.balance);
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const span = max - min || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return points
    .map((point, index) => {
      const x = padding + (points.length === 1 ? usableWidth : (index / (points.length - 1)) * usableWidth);
      const y = padding + usableHeight - ((point.balance - min) / span) * usableHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function BalanceLineChart({ points }: { points: BalancePoint[] }) {
  const width = 900;
  const height = 280;
  const padding = 28;
  const path = pathFromPoints(points, width, height, padding);
  const first = points[0];
  const last = points.at(-1);
  const balances = points.map((point) => point.balance);
  const min = balances.length ? Math.min(...balances) : 0;
  const max = balances.length ? Math.max(...balances) : 0;

  if (!points.length) {
    return (
      <div className="chart-empty">
        <strong>Sem dados para o grafico.</strong>
        <p>Quando houver lancamentos pessoais, a evolucao do saldo aparece aqui.</p>
      </div>
    );
  }

  return (
    <div className="balance-chart">
      <div className="chart-summary">
        <span>{first ? formatDate(first.date) : ""}</span>
        <strong>{last ? brl.format(last.balance) : brl.format(0)}</strong>
        <span>{last ? formatDate(last.date) : ""}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolucao do saldo dia a dia">
        <line x1={padding} x2={width - padding} y1={padding} y2={padding} className="chart-grid-line" />
        <line x1={padding} x2={width - padding} y1={height / 2} y2={height / 2} className="chart-grid-line" />
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} className="chart-grid-line" />
        <path d={path} className="chart-line" />
      </svg>
      <div className="chart-range">
        <span>Min {brl.format(min)}</span>
        <span>Max {brl.format(max)}</span>
      </div>
    </div>
  );
}
