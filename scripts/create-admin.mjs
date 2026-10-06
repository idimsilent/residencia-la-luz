/**
 * Crea (o promociona) una cuenta administradora de forma segura.
 *
 * Uso:
 *   node --env-file=.env.local scripts/create-admin.mjs correo@dominio.es [admin|editor]
 *
 * - Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (solo en tu equipo).
 * - Si la cuenta no existe, se crea con una contraseña aleatoria robusta que se
 *   muestra UNA vez. Cámbiala tras el primer acceso ("¿Has olvidado la contraseña?").
 * - Si existe, solo se le asigna el rol.
 * - No hay contraseñas por defecto en el código.
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const [, , emailArg, roleArg = "admin"] = process.argv;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!emailArg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailArg)) {
  console.error("Indica un correo válido: node --env-file=.env.local scripts/create-admin.mjs correo@dominio.es [admin|editor]");
  process.exit(1);
}
if (!["admin", "editor"].includes(roleArg)) {
  console.error("El rol debe ser 'admin' o 'editor'.");
  process.exit(1);
}
if (!url || !secret) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en el entorno.");
  process.exit(1);
}

const email = emailArg.toLowerCase();
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

function strongPassword() {
  // 18 caracteres con mayúsculas, minúsculas, números y símbolos.
  const raw = randomBytes(18).toString("base64").replace(/[^A-Za-z0-9]/g, "");
  return `${raw.slice(0, 14)}Aa7!`;
}

let userId;
let password = process.env.ADMIN_PASSWORD;
const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) {
  console.error("No se pudo consultar Supabase Auth:", listError.message);
  process.exit(1);
}
const existing = list.users.find((u) => u.email?.toLowerCase() === email);

if (existing) {
  userId = existing.id;
  console.log(`La cuenta ${email} ya existe: se le asignará el rol '${roleArg}'.`);
} else {
  password ??= strongPassword();
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error("No se pudo crear la cuenta:", error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`Cuenta creada: ${email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Contraseña temporal (se muestra una sola vez): ${password}`);
    console.log("Cámbiala tras el primer acceso desde «¿Has olvidado la contraseña?».");
  }
}

// El trigger handle_new_user crea el perfil; por si acaso se asegura aquí.
const { error: upsertError } = await supabase
  .from("profiles")
  .upsert({ id: userId, email, role: roleArg }, { onConflict: "id" });
if (upsertError) {
  console.error("No se pudo asignar el rol:", upsertError.message);
  process.exit(1);
}
console.log(`Rol '${roleArg}' asignado correctamente.`);
