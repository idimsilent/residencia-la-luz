/**
 * Tipografías disponibles (preseleccionadas, servidas con next/font).
 * La clave se guarda en el tema; aquí se mapea a la variable CSS.
 */
export const FONT_OPTIONS = {
  "nunito-sans": { label: "Nunito Sans (redondeada, cercana)", cssVar: "--font-nunito-sans" },
  inter: { label: "Inter (neutra, muy legible)", cssVar: "--font-inter" },
  "source-sans": { label: "Source Sans 3 (clásica)", cssVar: "--font-source-sans" },
  lora: { label: "Lora (serif cálida)", cssVar: "--font-lora" },
  fraunces: { label: "Fraunces (serif con carácter)", cssVar: "--font-fraunces" },
  "dm-serif": { label: "DM Serif Display (titulares elegantes)", cssVar: "--font-dm-serif" },
} as const;

export type FontKey = keyof typeof FONT_OPTIONS;
export const FONT_KEYS = Object.keys(FONT_OPTIONS) as [FontKey, ...FontKey[]];
