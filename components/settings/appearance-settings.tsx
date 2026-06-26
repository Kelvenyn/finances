"use client";

import {
  defaultPremiumPreferences,
  premiumPalettes,
  type AppearanceMode,
  type DashboardPeriod,
  type SidebarPreference,
} from "@/lib/ui/preferences";
import { useAppearance } from "@/components/layout/appearance-provider";
import type { ProfileType } from "@/lib/types";

const modes: Array<{ value: AppearanceMode; label: string }> = [
  { value: "dark", label: "Escuro" },
  { value: "light", label: "Claro" },
  { value: "system", label: "Sistema" },
];

const sidebars: Array<{ value: SidebarPreference; label: string }> = [
  { value: "auto", label: "Inteligente" },
  { value: "expanded", label: "Aberta" },
  { value: "collapsed", label: "Fechada" },
];

const periods: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "ytd", label: "Ano atual" },
  { value: "all", label: "Tudo" },
];

const profiles: Array<{ value: ProfileType; label: string }> = [
  { value: "personal", label: "Pessoal" },
  { value: "business", label: "Empresarial" },
];

export function AppearanceSettings() {
  const { preferences, setPreferences, resetPreferences } = useAppearance();

  return (
    <div className="appearance-settings">
      <section className="settings-section">
        <div>
          <span className="eyebrow">Paletas</span>
          <h2>Cores do painel</h2>
          <p>Escolha uma identidade visual para testar o clima do produto.</p>
        </div>

        <div className="palette-grid">
          {premiumPalettes.map((palette) => (
            <button
              key={palette.id}
              type="button"
              className={preferences.paletteId === palette.id ? "active" : ""}
              onClick={() => setPreferences({ paletteId: palette.id })}
            >
              <span className="palette-swatch">
                <i style={{ backgroundColor: palette.accent }} />
                <i style={{ backgroundColor: palette.chartIncome }} />
                <i style={{ backgroundColor: palette.chartExpense }} />
              </span>
              <strong>{palette.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section settings-controls">
        <PreferenceSelect
          label="Modo"
          value={preferences.mode}
          options={modes}
          onChange={(mode) => setPreferences({ mode })}
        />
        <PreferenceSelect
          label="Sidebar"
          value={preferences.sidebar}
          options={sidebars}
          onChange={(sidebar) => setPreferences({ sidebar })}
        />
        <PreferenceSelect
          label="Periodo padrao"
          value={preferences.defaultPeriod}
          options={periods}
          onChange={(defaultPeriod) => setPreferences({ defaultPeriod })}
        />
        <PreferenceSelect
          label="Perfil padrao"
          value={preferences.defaultProfile}
          options={profiles}
          onChange={(defaultProfile) => setPreferences({ defaultProfile })}
        />

        <label className="toggle-row">
          <span>
            <strong>Ocultar valores</strong>
            <small>Modo discreto para usar o app em locais publicos.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.hideValues}
            onChange={(event) => setPreferences({ hideValues: event.target.checked })}
          />
        </label>

        <button
          type="button"
          className="secondary-action"
          onClick={() => setPreferences(defaultPremiumPreferences)}
        >
          Restaurar padrao
        </button>
        <button type="button" className="ghost-action" onClick={resetPreferences}>
          Limpar preferencias
        </button>
      </section>
    </div>
  );
}

function PreferenceSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
