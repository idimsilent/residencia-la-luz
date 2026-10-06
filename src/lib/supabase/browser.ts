"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Cliente de navegador (solo clave publicable). Uso puntual en el panel. */
export function createClient(url: string, publishableKey: string) {
  return createBrowserClient<Database>(url, publishableKey);
}
