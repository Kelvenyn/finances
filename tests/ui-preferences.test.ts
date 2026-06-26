import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPremiumPreferences,
  mergePreferences,
  paletteToCssVariables,
  parseProfile,
  premiumPalettes,
  profileMeta,
} from "@/lib/ui/preferences";

test("parseProfile keeps valid profiles and defaults invalid values to personal", () => {
  assert.equal(parseProfile("personal"), "personal");
  assert.equal(parseProfile("business"), "business");
  assert.equal(parseProfile("empresa"), "personal");
  assert.equal(parseProfile(null), "personal");
});

test("profileMeta returns user-facing labels for each profile", () => {
  assert.deepEqual(profileMeta("personal"), {
    label: "Pessoal",
    subtitle: "Vida pessoal",
    iconLabel: "KP",
  });

  assert.deepEqual(profileMeta("business"), {
    label: "Empresarial",
    subtitle: "Operacao online",
    iconLabel: "PJ",
  });
});

test("premium palettes expose ten complete palette options", () => {
  assert.equal(premiumPalettes.length, 10);

  for (const palette of premiumPalettes) {
    assert.ok(palette.id);
    assert.ok(palette.name);
    assert.ok(palette.accent);
    assert.ok(palette.chartIncome);
    assert.ok(palette.chartExpense);
  }
});

test("paletteToCssVariables falls back to the default palette", () => {
  const defaultVars = paletteToCssVariables(defaultPremiumPreferences.paletteId);
  const unknownVars = paletteToCssVariables("unknown");

  assert.deepEqual(unknownVars, defaultVars);
  assert.equal(defaultVars["--accent"], premiumPalettes[0]?.accent);
});

test("mergePreferences keeps defaults and accepts valid partial preferences", () => {
  assert.deepEqual(mergePreferences({}), defaultPremiumPreferences);

  assert.deepEqual(mergePreferences({ defaultProfile: "business", hideValues: true }), {
    ...defaultPremiumPreferences,
    defaultProfile: "business",
    hideValues: true,
  });
});
