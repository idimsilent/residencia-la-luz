import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

/**
 * Cliente anónimo sin cookies para leer contenido público. RLS garantiza
 * que solo devuelve contenido publicado.
 */
export function createPublicClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
