"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clearRateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminBasePath } from "@/lib/admin-path";
import { env } from "@/lib/env";
import { fail, GENERIC_ERROR, type ActionResult } from "@/lib/action-result";
import { loginSchema, newPasswordSchema, resetSchema } from "./schema";

const LOGIN_WINDOW = 15 * 60;

function safeNext(next: unknown): string {
  const base = getAdminBasePath();
  if (typeof next === "string" && (next === base || next.startsWith(`${base}/`)) && !next.includes("//")) return next;
  return base;
}

/** Inicio de sesión con limitación de intentos por IP y por cuenta+IP. */
export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fail("Revisa los campos.", z.flattenError(parsed.error).fieldErrors);

  const ip = await clientIp();
  const email = parsed.data.email.toLowerCase();
  const ipOk = await checkRateLimit("login-ip", ip, 30, LOGIN_WINDOW);
  const accountOk = ipOk && (await checkRateLimit("login", `${email}|${ip}`, 5, LOGIN_WINDOW));
  if (!ipOk || !accountOk) {
    return fail("Demasiados intentos. Por seguridad, espera 15 minutos antes de volver a intentarlo.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !data.user) {
    // Mensaje genérico: no revela si la cuenta existe.
    return fail("Correo o contraseña incorrectos.");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!profile?.role) {
    await supabase.auth.signOut();
    return fail("Esta cuenta no tiene permisos para acceder al panel. Contacta con la persona administradora.");
  }

  await clearRateLimit("login", `${email}|${ip}`);
  redirect(safeNext(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`${getAdminBasePath()}/acceso`);
}

/** Solicitud de recuperación. Responde siempre igual para no revelar cuentas. */
export async function requestPasswordReset(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Revisa los campos.", z.flattenError(parsed.error).fieldErrors);
  const ip = await clientIp();
  const ok = await checkRateLimit("reset", ip, 5, 60 * 60);
  const message = "Si el correo corresponde a una cuenta autorizada, recibirás un enlace para crear una nueva contraseña.";
  if (!ok) return { ok: true, message };

  const base = getAdminBasePath();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${env.siteUrl}${base}/auth/confirm?next=${encodeURIComponent(`${base}/nueva-contrasena`)}`,
  });
  if (error) console.error("[auth] reset", error.status);
  return { ok: true, message };
}

export async function updatePassword(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return fail("Revisa los campos.", z.flattenError(parsed.error).fieldErrors);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("El enlace ha caducado. Solicita uno nuevo.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return fail(error.code === "same_password" ? "La nueva contraseña debe ser distinta de la anterior." : error.code === "weak_password" ? "La contraseña es demasiado débil." : GENERIC_ERROR);
  }
  redirect(getAdminBasePath());
}
