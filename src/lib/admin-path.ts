/**
 * Ruta pública del panel de administración, configurable con ADMIN_PATH.
 * Internamente el panel vive en /panel-interno; el proxy reescribe
 * ADMIN_PATH -> /panel-interno y bloquea el acceso directo a la ruta interna.
 *
 * Importante: ocultar la URL NO es una medida de seguridad. Toda operación
 * se valida con sesión, rol en servidor y RLS en la base de datos.
 */
export const INTERNAL_ADMIN_PREFIX = "/panel-interno";

const RESERVED = new Set([
  "",
  "/",
  "/api",
  "/_next",
  "/noticias",
  "/eventos",
  "/servicios",
  "/instalaciones",
  "/contacto",
  INTERNAL_ADMIN_PREFIX,
]);

export function normalizeAdminPath(raw: string | undefined): string {
  const fallback = "/gestion-centro";
  if (!raw) return fallback;
  let value = raw.trim().toLowerCase();
  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\/+$/, "");
  if (!/^\/[a-z0-9][a-z0-9-]{2,63}$/.test(value) || RESERVED.has(value)) {
    return fallback;
  }
  return value;
}

/** Se resuelve en servidor (proxy, layouts y acciones). */
export function getAdminBasePath(): string {
  return normalizeAdminPath(process.env.ADMIN_PATH);
}
