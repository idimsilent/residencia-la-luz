import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Cliente con la clave secreta (service role). IGNORA RLS.
 * Uso restringido a: limitación de intentos y guardado de mensajes de
 * contacto ya validados. Nunca exponer al navegador.
 */
export function createServiceClient() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    throw new Error("SUPABASE_SERVICE_NOT_CONFIGURED");
  }
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
