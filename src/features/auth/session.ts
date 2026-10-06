import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminBasePath } from "@/lib/admin-path";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];

/** Sesión actual validada contra Supabase Auth (getUser) y su perfil. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: profile ?? null };
});

/** Para páginas del panel: exige sesión. Devuelve null si la cuenta no tiene rol. */
export async function requireStaffPage() {
  const session = await getSession();
  if (!session) redirect(`${getAdminBasePath()}/acceso`);
  if (!session.profile?.role) return { ...session, role: null as AppRole | null };
  return { ...session, role: session.profile.role };
}

export class AuthorizationError extends Error {
  constructor(message = "No tienes permisos para realizar esta acción.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Para acciones del servidor: exige sesión válida y rol. La base de datos
 * vuelve a comprobarlo con RLS, pero así se falla pronto y con un mensaje claro.
 */
export async function requireStaffAction(minRole: AppRole = "editor") {
  const session = await getSession();
  if (!session || !session.profile?.role) throw new AuthorizationError("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  if (minRole === "admin" && session.profile.role !== "admin") {
    throw new AuthorizationError("Esta acción requiere permisos de administrador.");
  }
  return { supabase: session.supabase, user: session.user, profile: session.profile, role: session.profile.role };
}
