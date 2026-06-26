import type { ProfileType } from "@/lib/types";

export type AppearanceMode = "dark" | "light" | "system";
export type SidebarPreference = "auto" | "expanded" | "collapsed";
export type DashboardPeriod = "7d" | "30d" | "90d" | "ytd" | "all";

export interface PremiumPreferences {
  mode: AppearanceMode;
  paletteId: string;
  sidebar: SidebarPreference;
  hideValues: boolean;
  defaultPeriod: DashboardPeriod;
  defaultProfile: ProfileType;
  dashboardBlocks: string[];
}

export interface PremiumPalette {
  id: string;
  name: string;
  accent: string;
  accentSoft: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  text: string;
  muted: string;
  chartIncome: string;
  chartExpense: string;
  chartBalance: string;
}

export const premiumPalettes: PremiumPalette[] = [
  {
    id: "aurora-teal",
    name: "Aurora Teal",
    accent: "#14b8a6",
    accentSoft: "rgba(20, 184, 166, 0.18)",
    surface: "#091318",
    surfaceStrong: "#101f26",
    border: "rgba(148, 163, 184, 0.2)",
    text: "#f8fafc",
    muted: "#94a3b8",
    chartIncome: "#34d399",
    chartExpense: "#fb7185",
    chartBalance: "#38bdf8",
  },
  {
    id: "graphite-gold",
    name: "Graphite Gold",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.18)",
    surface: "#11100d",
    surfaceStrong: "#211e17",
    border: "rgba(234, 179, 8, 0.22)",
    text: "#fff7ed",
    muted: "#b8afa0",
    chartIncome: "#22c55e",
    chartExpense: "#ef4444",
    chartBalance: "#fbbf24",
  },
  {
    id: "midnight-cyan",
    name: "Midnight Cyan",
    accent: "#06b6d4",
    accentSoft: "rgba(6, 182, 212, 0.18)",
    surface: "#08111f",
    surfaceStrong: "#0f1d31",
    border: "rgba(125, 211, 252, 0.2)",
    text: "#f8fafc",
    muted: "#9fb1c7",
    chartIncome: "#2dd4bf",
    chartExpense: "#f43f5e",
    chartBalance: "#60a5fa",
  },
  {
    id: "obsidian-lime",
    name: "Obsidian Lime",
    accent: "#84cc16",
    accentSoft: "rgba(132, 204, 22, 0.16)",
    surface: "#0b100d",
    surfaceStrong: "#152018",
    border: "rgba(190, 242, 100, 0.18)",
    text: "#f7fee7",
    muted: "#a8b89a",
    chartIncome: "#4ade80",
    chartExpense: "#f97316",
    chartBalance: "#a3e635",
  },
  {
    id: "royal-rose",
    name: "Royal Rose",
    accent: "#e11d48",
    accentSoft: "rgba(225, 29, 72, 0.17)",
    surface: "#130b10",
    surfaceStrong: "#24121a",
    border: "rgba(251, 113, 133, 0.2)",
    text: "#fff1f2",
    muted: "#bfa3ac",
    chartIncome: "#10b981",
    chartExpense: "#fb7185",
    chartBalance: "#c084fc",
  },
  {
    id: "steel-emerald",
    name: "Steel Emerald",
    accent: "#10b981",
    accentSoft: "rgba(16, 185, 129, 0.16)",
    surface: "#0c1211",
    surfaceStrong: "#16211f",
    border: "rgba(110, 231, 183, 0.18)",
    text: "#ecfdf5",
    muted: "#9fb8b0",
    chartIncome: "#22c55e",
    chartExpense: "#f87171",
    chartBalance: "#5eead4",
  },
  {
    id: "carbon-blue",
    name: "Carbon Blue",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.17)",
    surface: "#0a0f18",
    surfaceStrong: "#121a28",
    border: "rgba(147, 197, 253, 0.18)",
    text: "#eff6ff",
    muted: "#a7b4c8",
    chartIncome: "#34d399",
    chartExpense: "#f87171",
    chartBalance: "#60a5fa",
  },
  {
    id: "platinum-violet",
    name: "Platinum Violet",
    accent: "#8b5cf6",
    accentSoft: "rgba(139, 92, 246, 0.17)",
    surface: "#100d16",
    surfaceStrong: "#1d1728",
    border: "rgba(196, 181, 253, 0.18)",
    text: "#faf5ff",
    muted: "#b5a8ca",
    chartIncome: "#2dd4bf",
    chartExpense: "#fb7185",
    chartBalance: "#a78bfa",
  },
  {
    id: "copper-slate",
    name: "Copper Slate",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.16)",
    surface: "#111315",
    surfaceStrong: "#1d2226",
    border: "rgba(251, 146, 60, 0.18)",
    text: "#f8fafc",
    muted: "#a8b0bb",
    chartIncome: "#22c55e",
    chartExpense: "#ef4444",
    chartBalance: "#fb923c",
  },
  {
    id: "polar-mint",
    name: "Polar Mint",
    accent: "#0f766e",
    accentSoft: "rgba(15, 118, 110, 0.14)",
    surface: "#f7faf9",
    surfaceStrong: "#e7f1ef",
    border: "rgba(15, 118, 110, 0.2)",
    text: "#0f172a",
    muted: "#64748b",
    chartIncome: "#059669",
    chartExpense: "#dc2626",
    chartBalance: "#0891b2",
  },
];

export const defaultPremiumPreferences: PremiumPreferences = {
  mode: "dark",
  paletteId: premiumPalettes[0].id,
  sidebar: "auto",
  hideValues: false,
  defaultPeriod: "30d",
  defaultProfile: "personal",
  dashboardBlocks: [
    "summary",
    "balance-chart",
    "cashflow-chart",
    "latest-transactions",
  ],
};

export function parseProfile(value?: string | null): ProfileType {
  return value === "business" ? "business" : "personal";
}

export function profileMeta(profile: ProfileType) {
  if (profile === "business") {
    return {
      label: "Empresarial",
      subtitle: "Operacao online",
      iconLabel: "PJ",
    };
  }

  return {
    label: "Pessoal",
    subtitle: "Vida pessoal",
    iconLabel: "KP",
  };
}

export function paletteToCssVariables(paletteId: string): Record<string, string> {
  const palette =
    premiumPalettes.find((candidate) => candidate.id === paletteId) ??
    premiumPalettes[0];

  return {
    "--accent": palette.accent,
    "--accent-soft": palette.accentSoft,
    "--surface": palette.surface,
    "--surface-strong": palette.surfaceStrong,
    "--premium-border": palette.border,
    "--premium-text": palette.text,
    "--premium-muted": palette.muted,
    "--chart-income": palette.chartIncome,
    "--chart-expense": palette.chartExpense,
    "--chart-balance": palette.chartBalance,
  };
}

export function mergePreferences(
  input: Partial<PremiumPreferences>,
): PremiumPreferences {
  const paletteId: string =
    typeof input.paletteId === "string" &&
    premiumPalettes.some((palette) => palette.id === input.paletteId)
      ? input.paletteId
      : defaultPremiumPreferences.paletteId;

  return {
    ...defaultPremiumPreferences,
    ...input,
    dashboardBlocks:
      input.dashboardBlocks ?? defaultPremiumPreferences.dashboardBlocks,
    defaultProfile: parseProfile(input.defaultProfile),
    paletteId,
    mode: isAppearanceMode(input.mode)
      ? input.mode
      : defaultPremiumPreferences.mode,
    sidebar: isSidebarPreference(input.sidebar)
      ? input.sidebar
      : defaultPremiumPreferences.sidebar,
    defaultPeriod: isDashboardPeriod(input.defaultPeriod)
      ? input.defaultPeriod
      : defaultPremiumPreferences.defaultPeriod,
  };
}

function isAppearanceMode(value: unknown): value is AppearanceMode {
  return value === "dark" || value === "light" || value === "system";
}

function isSidebarPreference(value: unknown): value is SidebarPreference {
  return value === "auto" || value === "expanded" || value === "collapsed";
}

function isDashboardPeriod(value: unknown): value is DashboardPeriod {
  return (
    value === "7d" ||
    value === "30d" ||
    value === "90d" ||
    value === "ytd" ||
    value === "all"
  );
}
