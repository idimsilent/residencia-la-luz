import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { INTERNAL_ADMIN_PREFIX, normalizeAdminPath } from "@/lib/admin-path";
import { normalizeSupabaseUrl } from "@/lib/supabase-url";

/**
 * Proxy (antes "middleware"):
 *  1. Reescribe la ruta configurable del panel (ADMIN_PATH) a la ruta interna.
 *  2. Bloquea el acceso directo a la ruta interna (devuelve 404).
 *  3. Refresca la sesión de Supabase y redirige al acceso si no hay sesión.
 *
 * Es solo la primera barrera: cada página y acción del panel vuelve a
 * comprobar la sesión y el rol en servidor, y la base de datos aplica RLS.
 */

const PUBLIC_ADMIN_ROUTES = ["/acceso", "/recuperar", "/nueva-contrasena", "/auth/confirm"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const adminBase = normalizeAdminPath(process.env.ADMIN_PATH);

  // Acceso directo a la ruta interna: no existe para el exterior.
  if (pathname === INTERNAL_ADMIN_PREFIX || pathname.startsWith(`${INTERNAL_ADMIN_PREFIX}/`)) {
    return NextResponse.rewrite(new URL("/__no-encontrado", request.url), { status: 404 });
  }

  const isAdmin = pathname === adminBase || pathname.startsWith(`${adminBase}/`);
  if (!isAdmin) {
    return NextResponse.next();
  }

  const subPath = pathname.slice(adminBase.length) || "/";
  const internalUrl = request.nextUrl.clone();
  internalUrl.pathname = `${INTERNAL_ADMIN_PREFIX}${subPath === "/" ? "" : subPath}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-base", adminBase);
  requestHeaders.set("x-pathname", pathname);

  const makeResponse = () =>
    NextResponse.rewrite(internalUrl, { request: { headers: requestHeaders } });

  let response = makeResponse();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");

  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Sin Supabase el panel muestra la guía de configuración.
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = makeResponse();
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
        response.headers.set("Cache-Control", "no-store");
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida el token contra el servidor de Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some(
    (route) => subPath === route || subPath.startsWith(`${route}/`),
  );

  if (!user && !isPublicAdminRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `${adminBase}/acceso`;
    loginUrl.search = "";
    const next = `${pathname}${search}`;
    if (next !== adminBase) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (user && subPath === "/acceso") {
    const home = request.nextUrl.clone();
    home.pathname = adminBase;
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: [
    // Todo salvo estáticos, imágenes optimizadas y ficheros públicos.
    "/((?!_next/static|_next/image|favicon.ico|demo/|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
