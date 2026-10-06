import { z } from "zod";
import { FONT_KEYS } from "./fonts";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal no válido (#rrggbb)");

/**
 * Tokens de diseño de un tema. Se guardan como JSON en la tabla themes y se
 * convierten en variables CSS. Cada valor está acotado para que ningún
 * cambio pueda romper la maquetación o inyectar CSS.
 */
export const themeTokensSchema = z.object({
  version: z.literal(1).default(1),
  colors: z.object({
    primary: hex,
    primaryContrast: hex,
    secondary: hex,
    accent: hex,
    background: hex,
    surface: hex,
    surfaceAlt: hex,
    text: hex,
    textMuted: hex,
    border: hex,
    buttonBg: hex,
    buttonText: hex,
    headerBg: hex,
    headerText: hex,
    footerBg: hex,
    footerText: hex,
  }),
  typography: z.object({
    headingFont: z.enum(FONT_KEYS),
    bodyFont: z.enum(FONT_KEYS),
    baseSize: z.number().int().min(16).max(20),
    headingScale: z.number().min(1.1).max(1.45),
    headingWeight: z.enum(["500", "600", "700"]),
  }),
  shape: z.object({
    radius: z.number().int().min(0).max(32),
    shadow: z.enum(["none", "soft", "medium"]),
    spacing: z.enum(["compact", "normal", "airy"]),
    contentWidth: z.enum(["narrow", "normal", "wide"]),
  }),
  components: z.object({
    buttonStyle: z.enum(["solid", "soft", "outline", "pill"]),
    cardStyle: z.enum(["elevated", "bordered", "flat"]),
    headerLayout: z.enum(["classic", "centered", "minimal"]),
    headerSticky: z.boolean(),
    menuStyle: z.enum(["underline", "pill", "plain"]),
    footerLayout: z.enum(["columns", "simple"]),
    galleryStyle: z.enum(["grid", "mosaic"]),
    newsCardStyle: z.enum(["feed", "cards"]),
    blockStyle: z.enum(["open", "boxed"]),
  }),
});

export type ThemeTokens = z.infer<typeof themeTokensSchema>;

export function parseTheme(value: unknown): ThemeTokens | null {
  const parsed = themeTokensSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
