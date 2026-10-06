import { FONT_OPTIONS } from "./fonts";
import type { ThemeTokens } from "./schema";

const SHADOWS = {
  none: { sm: "none", md: "none", lg: "none" },
  soft: {
    sm: "0 1px 2px rgb(30 35 30 / 0.05)",
    md: "0 6px 20px -6px rgb(30 35 30 / 0.12)",
    lg: "0 18px 40px -16px rgb(30 35 30 / 0.20)",
  },
  medium: {
    sm: "0 1px 3px rgb(20 25 20 / 0.10)",
    md: "0 10px 28px -8px rgb(20 25 20 / 0.20)",
    lg: "0 24px 50px -18px rgb(20 25 20 / 0.30)",
  },
} as const;

const SPACING = { compact: "0.8", normal: "1", airy: "1.25" } as const;
const WIDTH = { narrow: "68rem", normal: "76rem", wide: "86rem" } as const;

/**
 * Genera las variables CSS de un tema. Todos los valores proceden de un
 * esquema validado (colores hex, enumerados y números acotados), por lo que
 * no es posible inyectar CSS arbitrario.
 */
export function themeToCssVars(t: ThemeTokens): Record<string, string> {
  const c = t.colors;
  const shadow = SHADOWS[t.shape.shadow];
  return {
    "--lz-color-primary": c.primary,
    "--lz-color-primary-contrast": c.primaryContrast,
    "--lz-color-secondary": c.secondary,
    "--lz-color-accent": c.accent,
    "--lz-color-background": c.background,
    "--lz-color-surface": c.surface,
    "--lz-color-surface-alt": c.surfaceAlt,
    "--lz-color-text": c.text,
    "--lz-color-text-muted": c.textMuted,
    "--lz-color-border": c.border,
    "--lz-color-button-bg": c.buttonBg,
    "--lz-color-button-text": c.buttonText,
    "--lz-color-header-bg": c.headerBg,
    "--lz-color-header-text": c.headerText,
    "--lz-color-footer-bg": c.footerBg,
    "--lz-color-footer-text": c.footerText,
    "--lz-font-heading": `var(${FONT_OPTIONS[t.typography.headingFont].cssVar})`,
    "--lz-font-body": `var(${FONT_OPTIONS[t.typography.bodyFont].cssVar})`,
    "--lz-text-base": `${t.typography.baseSize}px`,
    "--lz-heading-scale": String(t.typography.headingScale),
    "--lz-heading-weight": t.typography.headingWeight,
    "--lz-radius": `${t.shape.radius}px`,
    "--lz-shadow-sm": shadow.sm,
    "--lz-shadow-md": shadow.md,
    "--lz-shadow-lg": shadow.lg,
    "--lz-space": SPACING[t.shape.spacing],
    "--lz-content-width": WIDTH[t.shape.contentWidth],
  };
}

export function themeToCss(t: ThemeTokens, selector = ":root"): string {
  const vars = themeToCssVars(t);
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `${selector}{${body}}`;
}

/** Atributos data-* que activan variantes de componentes en el CSS global. */
export function themeDataAttributes(t: ThemeTokens): Record<string, string> {
  return {
    "data-button": t.components.buttonStyle,
    "data-card": t.components.cardStyle,
    "data-header": t.components.headerLayout,
    "data-menu": t.components.menuStyle,
    "data-footer": t.components.footerLayout,
    "data-gallery": t.components.galleryStyle,
    "data-newscard": t.components.newsCardStyle,
    "data-blocks": t.components.blockStyle,
  };
}

/** Contraste WCAG entre dos colores hex. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
