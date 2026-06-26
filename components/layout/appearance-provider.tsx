"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultPremiumPreferences,
  mergePreferences,
  paletteToCssVariables,
  type PremiumPreferences,
} from "@/lib/ui/preferences";

const storageKey = "finance-core-premium-preferences";

interface AppearanceContextValue {
  preferences: PremiumPreferences;
  setPreferences: (updates: Partial<PremiumPreferences>) => void;
  resetPreferences: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferenceState] = useState(loadStoredPreferences);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
    const root = document.documentElement;
    const cssVariables = paletteToCssVariables(preferences.paletteId);

    root.dataset.appearanceMode = resolveMode(preferences.mode);
    root.dataset.sidebarPreference = preferences.sidebar;
    root.dataset.hideValues = String(preferences.hideValues);

    for (const [name, value] of Object.entries(cssVariables)) {
      root.style.setProperty(name, value);
    }
  }, [preferences]);

  const setPreferences = useCallback((updates: Partial<PremiumPreferences>) => {
    setPreferenceState((current) => mergePreferences({ ...current, ...updates }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferenceState(defaultPremiumPreferences);
  }, []);

  const value = useMemo(
    () => ({ preferences, setPreferences, resetPreferences }),
    [preferences, resetPreferences, setPreferences],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used inside AppearanceProvider");
  }

  return context;
}

function resolveMode(mode: PremiumPreferences["mode"]) {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  return mode;
}

function loadStoredPreferences() {
  if (typeof window === "undefined") {
    return defaultPremiumPreferences;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return defaultPremiumPreferences;
  }

  try {
    return mergePreferences(JSON.parse(stored));
  } catch {
    window.localStorage.removeItem(storageKey);
    return defaultPremiumPreferences;
  }
}
