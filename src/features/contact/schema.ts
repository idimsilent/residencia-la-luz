import { z } from "zod";

/** Versión del texto informativo de privacidad aceptado en el formulario. */
export const PRIVACY_VERSION = "2026-10-v1";

/** Datos mínimos: no se solicitan datos de salud ni información de residentes. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre").max(120, "Máximo 120 caracteres"),
  email: z.email("Introduce un correo electrónico válido").max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s().-]*$/, "Teléfono no válido")
    .optional()
    .transform((v) => (v ? v : undefined)),
  subject: z.string().trim().max(150).optional().transform((v) => (v ? v : undefined)),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000, "Máximo 3000 caracteres"),
  privacy: z.literal("on", { error: "Debes aceptar la política de privacidad" }),
});

export type ContactInput = z.input<typeof contactSchema>;
