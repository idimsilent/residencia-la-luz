import { NextResponse, type NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { PREVIEW_THEME_COOKIE } from "@/lib/preview";
import { isUuid } from "@/lib/utils";

/**
 * Activa la vista previa (borradores y temas sin publicar) para el personal.
 * Uso: /api/preview?ruta=/noticias/mi-noticia[&tema=<uuid>]
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawPath = url.searchParams.get("ruta") ?? "/";
  // Solo rutas internas de la web pública (evita redirecciones abiertas).
  const path = /^\/(?!\/)[a-z0-9\-/]*$/i.test(rawPath) ? rawPath : "/";
  if (!isSupabaseConfigured()) return NextResponse.redirect(new URL(path, url));

  const supabase = await createClient();
  const { data: isStaff } = await supabase.rpc("is_staff");
  if (isStaff !== true) return new NextResponse("No autorizado", { status: 403 });

  (await draftMode()).enable();
  const res = NextResponse.redirect(new URL(path, url));
  const theme = url.searchParams.get("tema");
  if (theme && isUuid(theme)) {
    res.cookies.set(PREVIEW_THEME_COOKIE, theme, { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", path: "/", maxAge: 60 * 60 });
  } else {
    res.cookies.delete(PREVIEW_THEME_COOKIE);
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}
