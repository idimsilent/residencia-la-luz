import "server-only";

/**
 * Variables de entorno del servidor. Nunca importar desde componentes cliente.
 * Si Supabase no está configurado, la web muestra una pantalla de
 * "configuración pendiente" en lugar de simular datos.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export const env = {
  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey:
    read("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ?? read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseSecretKey: read("SUPABASE_SECRET_KEY") ?? read("SUPABASE_SERVICE_ROLE_KEY"),
  siteUrl: (read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, ""),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseSecretKey);
}
