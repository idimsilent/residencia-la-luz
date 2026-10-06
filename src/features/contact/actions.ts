"use server";

import { z } from "zod";
import { contactSchema, PRIVACY_VERSION } from "./schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/service";
import { isServiceRoleConfigured } from "@/lib/env";
import { fail, formValues, type ActionResult } from "@/lib/action-result";

const MIN_FILL_MS = 3000;

/**
 * Envío del formulario de contacto.
 * Antispam: campo trampa oculto, tiempo mínimo de cumplimentación y límite
 * de envíos por IP. Se guarda en la base de datos para el personal.
 */
export async function submitContact(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  // Campo trampa: los humanos no lo ven ni lo rellenan.
  if (String(formData.get("website") ?? "") !== "") {
    return { ok: true, message: "Gracias, hemos recibido tu mensaje." };
  }
  const values = formValues(formData, ["name", "email", "phone", "subject", "message"]);
  const startedAt = Number(formData.get("startedAt"));
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return fail("Por favor, revisa el formulario y vuelve a enviarlo.", undefined, values);
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    subject: formData.get("subject") ?? undefined,
    message: formData.get("message"),
    privacy: formData.get("privacy"),
  });
  if (!parsed.success) {
    return fail("Revisa los campos marcados.", z.flattenError(parsed.error).fieldErrors, values);
  }

  if (!isServiceRoleConfigured()) {
    console.error("[contacto] SUPABASE_SECRET_KEY no configurada");
    return fail("El formulario no está disponible en este momento. Llámanos o escríbenos por correo.", undefined, values);
  }

  const ip = await clientIp();
  const allowed = await checkRateLimit("contact", ip, 5, 60 * 60);
  if (!allowed) {
    return fail("Has enviado varios mensajes seguidos. Inténtalo más tarde o llámanos por teléfono.", undefined, values);
  }

  const db = createServiceClient();
  const { error } = await db.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    subject: parsed.data.subject ?? null,
    message: parsed.data.message,
    privacy_accepted: true,
    privacy_version: PRIVACY_VERSION,
  });
  if (error) {
    console.error("[contacto] error al guardar", error.code);
    return fail("No hemos podido enviar tu mensaje. Inténtalo de nuevo o llámanos por teléfono.", undefined, values);
  }
  return { ok: true, message: "Gracias, hemos recibido tu mensaje. Te responderemos lo antes posible." };
}
