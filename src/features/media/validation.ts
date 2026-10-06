/** Validación de ficheros subidos (se ejecuta en servidor). */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type AllowedMime = keyof typeof ALLOWED_TYPES;

/**
 * Detecta el tipo real por la firma de bytes ("magic numbers"), sin fiarse
 * de la extensión ni del Content-Type enviado por el navegador.
 */
export function sniffImageType(bytes: Uint8Array): AllowedMime | null {
  const b = bytes;
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

/** Nombre seguro: sin rutas, sin caracteres especiales, en minúsculas. */
export function safeBaseName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "imagen";
  const withoutExt = base.replace(/\.[^.]*$/, "");
  const clean = withoutExt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return clean || "imagen";
}

/** Título legible a partir del nombre del fichero. */
export function titleFromFileName(name: string): string {
  const base = safeBaseName(name).replace(/-/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}
