import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAdminBasePath } from "@/lib/admin-path";
import { env } from "@/lib/env";

/** Destino de los enlaces de recuperación de contraseña de Supabase. */
export async function GET(request: NextRequest) {
  const base = getAdminBasePath();
  const url = request.nextUrl;
  const nextParam = url.searchParams.get("next") ?? `${base}/nueva-contrasena`;
  const next = nextParam.startsWith(`${base}/`) && !nextParam.includes("//") ? nextParam : `${base}/nueva-contrasena`;
  const supabase = await createClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }
  const target = ok ? next : `${base}/recuperar?error=enlace`;
  return NextResponse.redirect(new URL(target, env.siteUrl));
}
