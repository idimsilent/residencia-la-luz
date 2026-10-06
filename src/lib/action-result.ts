export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors; values?: Record<string, string> };

export const GENERIC_ERROR = "No se ha podido completar la operación. Inténtalo de nuevo en unos minutos.";

export function fail(
  error: string,
  fieldErrors?: FieldErrors,
  values?: Record<string, string>,
): { ok: false; error: string; fieldErrors?: FieldErrors; values?: Record<string, string> } {
  return { ok: false, error, fieldErrors, values };
}

/** Valores de texto enviados (para no perderlos cuando React reinicia el formulario). */
export function formValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v.slice(0, 5000);
  }
  return out;
}
