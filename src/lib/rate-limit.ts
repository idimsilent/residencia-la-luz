import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { env, isServiceRoleConfigured } from "@/lib/env";

/** IP del cliente según la cabecera del proxy de la plataforma (Vercel). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export function hashKey(value: string): string {
  return createHash("sha256")
    .update(`${env.supabaseSecretKey ?? "local"}:${value}`)
    .digest("hex");
}

/**
 * Limita intentos usando la tabla rate_limit_hits (solo accesible con la
 * service role). Si la service role no está configurada, permite el intento
 * pero lo avisa en el registro del servidor (Supabase Auth aplica además sus
 * propios límites).
 */
export async function checkRateLimit(bucket: string, key: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!isServiceRoleConfigured()) {
    console.warn("[rate-limit] SUPABASE_SECRET_KEY no configurada: limitación desactivada");
    return true;
  }
  const db = createServiceClient();
  const { data, error } = await db.rpc("check_rate_limit", {
    p_bucket: bucket,
    p_key_hash: hashKey(key),
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("[rate-limit] error", error.message);
    // Ante un fallo de infraestructura se bloquea por seguridad.
    return false;
  }
  return data === true;
}

export async function clearRateLimit(bucket: string, key: string): Promise<void> {
  if (!isServiceRoleConfigured()) return;
  const db = createServiceClient();
  await db.rpc("clear_rate_limit", { p_bucket: bucket, p_key_hash: hashKey(key) });
}
