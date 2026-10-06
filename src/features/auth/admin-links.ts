import "server-only";
import { getAdminBasePath } from "@/lib/admin-path";

/** Construye un enlace del panel con la ruta configurable. */
export function adminHref(path = ""): string {
  const base = getAdminBasePath();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
