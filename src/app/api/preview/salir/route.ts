import { NextResponse, type NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { PREVIEW_THEME_COOKIE } from "@/lib/preview";

/** Sale del modo vista previa y vuelve a la página indicada. */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const rawPath = request.nextUrl.searchParams.get("ruta") ?? "/";
  const path = /^\/(?!\/)[a-z0-9\-/]*$/i.test(rawPath) ? rawPath : "/";
  const res = NextResponse.redirect(new URL(path, request.nextUrl));
  res.cookies.delete(PREVIEW_THEME_COOKIE);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
