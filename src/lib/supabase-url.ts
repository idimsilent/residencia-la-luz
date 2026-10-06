/**
 * Deja la URL de Supabase en su forma base (https://xxxx.supabase.co).
 * Es habitual copiar por error la del API (…/rest/v1/) o con barra final;
 * el cliente de Supabase añade esas rutas por su cuenta.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}
