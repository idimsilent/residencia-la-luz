import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Introduce un correo válido").max(254),
  password: z.string().min(1, "Introduce la contraseña").max(200),
});

/** Misma política que Supabase Auth (config.toml): 10 caracteres, mayúsculas, minúsculas y números. */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Mínimo 10 caracteres")
      .max(200)
      .regex(/[a-z]/, "Incluye al menos una letra minúscula")
      .regex(/[A-Z]/, "Incluye al menos una letra mayúscula")
      .regex(/\d/, "Incluye al menos un número"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" });

export const resetSchema = z.object({ email: z.email("Introduce un correo válido").max(254) });
