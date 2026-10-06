import "server-only";
import { z } from "zod";
import { AuthorizationError, requireStaffAction, type AppRole } from "./session";
import { fail, GENERIC_ERROR, type ActionResult } from "@/lib/action-result";

type Ctx = Awaited<ReturnType<typeof requireStaffAction>>;

/** Error de negocio con mensaje apto para mostrar al usuario. */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

/** Traduce errores de PostgreSQL/PostgREST a mensajes comprensibles sin detalles internos. */
export function dbErrorMessage(error: { code?: string; message?: string } | null): string {
  if (!error) return GENERIC_ERROR;
  switch (error.code) {
    case "23505":
      return "Ya existe un elemento con esa dirección (URL). Cambia el texto de la URL.";
    case "23503":
      return "Este elemento está relacionado con otro contenido y no se puede completar la operación.";
    case "23514":
      return "Algún dato no cumple las reglas de validación.";
    case "42501":
      return "No tienes permisos para realizar esta acción.";
    case "P0001":
      return error.message ?? GENERIC_ERROR;
    default:
      return GENERIC_ERROR;
  }
}

/**
 * Envoltorio común de las acciones del panel:
 *  - comprueba sesión y rol en servidor,
 *  - valida la entrada con zod,
 *  - transforma los errores en mensajes sin información interna.
 */
export async function runAction<S extends z.ZodType, T = undefined>(
  schema: S,
  input: unknown,
  fn: (data: z.infer<S>, ctx: Ctx) => Promise<ActionResult<T>>,
  minRole: AppRole = "editor",
): Promise<ActionResult<T>> {
  try {
    const ctx = await requireStaffAction(minRole);
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return fail("Revisa los campos marcados.", z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
    }
    return await fn(parsed.data, ctx);
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof UserError) return fail(err.message);
    // Las redirecciones de Next.js se propagan.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[admin-action]", err);
    return fail(GENERIC_ERROR);
  }
}
