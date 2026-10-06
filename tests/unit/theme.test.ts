import { describe, expect, it } from "vitest";
import { parseTheme } from "@/features/theme/schema";
import { PRESET_THEMES, SALVIA_THEME } from "@/features/theme/presets";
import { contrastRatio, themeToCss } from "@/features/theme/css";

describe("temas", () => {
  it("los temas predefinidos son válidos y legibles", () => {
    for (const p of PRESET_THEMES) {
      expect(parseTheme(p.tokens)).not.toBeNull();
      expect(contrastRatio(p.tokens.colors.text, p.tokens.colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.tokens.colors.buttonText, p.tokens.colors.buttonBg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("calcula el contraste según WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("rechaza valores que podrían inyectar CSS", () => {
    const bad = structuredClone(SALVIA_THEME) as unknown as { colors: { primary: string } };
    bad.colors.primary = "red;} body{display:none";
    expect(parseTheme(bad)).toBeNull();
  });

  it("acota tamaños de letra", () => {
    const bad = structuredClone(SALVIA_THEME);
    bad.typography.baseSize = 40;
    expect(parseTheme(bad)).toBeNull();
  });

  it("genera variables CSS", () => {
    const css = themeToCss(SALVIA_THEME, ":root");
    expect(css).toMatch(/^:root\{/);
    expect(css).toContain(`--lz-color-primary:${SALVIA_THEME.colors.primary}`);
  });
});
