import { DM_Serif_Display, Fraunces, Inter, Lora, Nunito_Sans, Source_Sans_3 } from "next/font/google";

/** Tipografías disponibles en el editor de temas (ver features/theme/fonts.ts). */
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans", display: "swap" });
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
export const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap", preload: false });
export const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap", preload: false });
export const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
  preload: false,
});

export const fontVariables = [nunitoSans, fraunces, inter, sourceSans, lora, dmSerif]
  .map((f) => f.variable)
  .join(" ");
