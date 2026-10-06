"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { createServiceClient } from "@/lib/supabase/service";
import { isServiceRoleConfigured, env } from "@/lib/env";
import { getAdminBasePath } from "@/lib/admin-path";
import { sanitizePlain } from "@/lib/sanitize";
import { slugify, SLUG_REGEX } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";

function revalidateSite() {
  revalidatePath("/", "layout");
}

const plain = (max: number) => z.string().trim().max(max).transform((v) => sanitizePlain(v));
const httpsOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s"'<>]+$/.test(v), "Debe empezar por https://");

/* ------------------------------------------------- Información del centro ---- */

const centerSchema = z.object({
  site_name: plain(120).pipe(z.string().min(1, "Escribe el nombre")),
  tagline: plain(200),
  logo_media_id: z.uuid().nullable(),
  favicon_media_id: z.uuid().nullable(),
  phone: plain(30),
  phone_secondary: plain(30),
  email: z.email("Correo no válido").or(z.literal("")),
  address_line: plain(200),
  postal_code: plain(10),
  city: plain(80),
  province: plain(80),
  map_url: httpsOrEmpty,
  opening_hours: z.array(z.object({ label: plain(60), hours: plain(80) })).max(10),
  social_links: z.array(z.object({ network: z.enum(["facebook", "instagram", "youtube", "linkedin", "x", "tiktok"]), url: httpsOrEmpty.pipe(z.string().min(1, "Falta el enlace")) })).max(8),
  contact_form_enabled: z.boolean(),
  testimonials_enabled: z.boolean(),
  contact_privacy_note: plain(1000),
  legal_owner_name: plain(160),
  legal_owner_tax_id: plain(20),
  show_demo_notice: z.boolean(),
});

export async function updateCenterInfo(input: z.input<typeof centerSchema>): Promise<ActionResult> {
  return runAction(
    centerSchema,
    input,
    async (d, { supabase }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ ...d, map_url: d.map_url || null, opening_hours: d.opening_hours.filter((h) => h.label || h.hours) })
        .eq("id", 1);
      if (error) throw new UserError(dbErrorMessage(error));
      revalidateSite();
      return { ok: true, message: "Información del centro guardada." };
    },
    "admin",
  );
}

const seoSchema = z.object({
  seo_title: plain(70),
  seo_description: plain(170),
  og_media_id: z.uuid().nullable(),
});

export async function updateSeo(input: z.input<typeof seoSchema>): Promise<ActionResult> {
  return runAction(
    seoSchema,
    input,
    async (d, { supabase }) => {
      const { error } = await supabase.from("site_settings").update(d).eq("id", 1);
      if (error) throw new UserError(dbErrorMessage(error));
      revalidateSite();
      return { ok: true, message: "Ajustes de buscadores guardados." };
    },
    "admin",
  );
}

/* --------------------------------------------------------------- Menús ---- */

const menuItemSchema = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(1, "Falta el texto").max(60),
  href: z.string().trim().max(300).regex(/^(\/[a-z0-9\-/]*|https:\/\/[^\s"'<>]+)$/, "Usa una ruta interna (/pagina) o un enlace https://"),
  is_visible: z.boolean(),
  open_in_new_tab: z.boolean(),
});

export async function saveMenu(input: { location: "header" | "footer" | "legal"; items: z.input<typeof menuItemSchema>[] }): Promise<ActionResult> {
  const schema = z.object({ location: z.enum(["header", "footer", "legal"]), items: z.array(menuItemSchema).max(30) });
  return runAction(
    schema,
    input,
    async ({ location, items }, { supabase }) => {
      const { data: existing } = await supabase.from("menu_items").select("id, is_system, href").eq("location", location);
      const byId = new Map((existing ?? []).map((e) => [e.id, e]));
      const keep = new Set(items.map((i) => i.id).filter(Boolean));
      // Los enlaces de sistema no se borran (se pueden ocultar).
      const missingSystem = (existing ?? []).filter((e) => e.is_system && !keep.has(e.id));
      if (missingSystem.length) throw new UserError("Los enlaces principales no se pueden borrar; ocúltalos si no quieres mostrarlos.");
      const toDelete = (existing ?? []).filter((e) => !keep.has(e.id)).map((e) => e.id);
      if (toDelete.length) {
        const { error } = await supabase.from("menu_items").delete().in("id", toDelete);
        if (error) throw new UserError(dbErrorMessage(error));
      }
      for (const [i, item] of items.entries()) {
        const prev = item.id ? byId.get(item.id) : undefined;
        const row = {
          location,
          label: sanitizePlain(item.label),
          href: prev?.is_system ? prev.href : item.href,
          is_visible: item.is_visible,
          open_in_new_tab: item.href.startsWith("https://") ? item.open_in_new_tab : false,
          sort_order: (i + 1) * 10,
        };
        const { error } = prev
          ? await supabase.from("menu_items").update(row).eq("id", prev.id)
          : await supabase.from("menu_items").insert(row);
        if (error) throw new UserError(dbErrorMessage(error));
      }
      revalidateSite();
      return { ok: true, message: "Menú guardado." };
    },
    "admin",
  );
}

/* ------------------------------------------------------------ Mensajes ---- */

export async function setMessageStatus(input: { ids: string[]; status: "new" | "read" | "archived" }): Promise<ActionResult> {
  const schema = z.object({ ids: z.array(z.uuid()).min(1).max(200), status: z.enum(["new", "read", "archived"]) });
  return runAction(schema, input, async ({ ids, status }, { supabase }) => {
    const { error } = await supabase.from("contact_messages").update({ status }).in("id", ids);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidatePath(`${getAdminBasePath()}`, "layout");
    return { ok: true };
  });
}

export async function deleteMessages(ids: string[]): Promise<ActionResult> {
  return runAction(
    z.array(z.uuid()).min(1).max(200),
    ids,
    async (list, { supabase }) => {
      const { error } = await supabase.from("contact_messages").delete().in("id", list);
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: list.length === 1 ? "Mensaje eliminado." : `${list.length} mensajes eliminados.` };
    },
    "admin",
  );
}

/* ---------------------------------------------------------- Categorías ---- */

const CATEGORY_TABLES = { news: "news_categories", events: "event_categories", gallery: "gallery_categories" } as const;
type CategoryKind = keyof typeof CATEGORY_TABLES;

const categorySchema = z.object({
  kind: z.enum(["news", "events", "gallery"]),
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Escribe un nombre").max(80),
  slug: z.string().trim().max(80).regex(SLUG_REGEX, "Solo minúsculas, números y guiones").or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function saveCategory(input: z.input<typeof categorySchema>): Promise<ActionResult> {
  return runAction(categorySchema, input, async (d, { supabase }) => {
    // event_categories es la tabla con más columnas (color); el color solo se envía para eventos.
    const table = CATEGORY_TABLES[d.kind as CategoryKind] as "event_categories";
    const row: { name: string; slug: string; color?: string } = { name: sanitizePlain(d.name), slug: d.slug || slugify(d.name) };
    if (d.kind === "events" && d.color) row.color = d.color.toLowerCase();
    if (d.id) {
      const { error } = await supabase.from(table).update(row).eq("id", d.id);
      if (error) throw new UserError(dbErrorMessage(error));
    } else {
      const { data: last } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const { error } = await supabase.from(table).insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 10 });
      if (error) throw new UserError(dbErrorMessage(error));
    }
    revalidateSite();
    return { ok: true, message: "Categoría guardada." };
  });
}

export async function deleteCategory(input: { kind: CategoryKind; id: string }): Promise<ActionResult> {
  return runAction(z.object({ kind: z.enum(["news", "events", "gallery"]), id: z.uuid() }), input, async ({ kind, id }, { supabase }) => {
    const { error } = await supabase.from(CATEGORY_TABLES[kind]).delete().eq("id", id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "Categoría eliminada. Su contenido queda sin categoría." };
  });
}

/* --------------------------------------------------------- Testimonios ---- */

const testimonialSchema = z
  .object({
    id: z.uuid().optional(),
    quote: z.string().trim().min(5, "Escribe el testimonio").max(800),
    author_label: z.string().trim().min(1, "Indica cómo firmarlo").max(120),
    consent_confirmed: z.boolean(),
    consent_reference: z.string().trim().max(200),
    status: z.enum(["draft", "published"]),
  })
  .refine((d) => d.status === "draft" || d.consent_confirmed, { path: ["consent_confirmed"], message: "Para publicarlo necesitas el consentimiento por escrito." });

export async function saveTestimonial(input: z.input<typeof testimonialSchema>): Promise<ActionResult> {
  return runAction(testimonialSchema, input, async ({ id, ...d }, { supabase }) => {
    const row = { ...d, quote: sanitizePlain(d.quote), author_label: sanitizePlain(d.author_label), consent_reference: d.consent_reference ? sanitizePlain(d.consent_reference) : null };
    const { error } = id ? await supabase.from("testimonials").update(row).eq("id", id) : await supabase.from("testimonials").insert(row);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "Testimonio guardado." };
  });
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return runAction(z.uuid(), id, async (tid, { supabase }) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", tid);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "Testimonio eliminado." };
  });
}

/* ------------------------------------------------------------ Usuarios ---- */

export async function setUserRole(input: { userId: string; role: "admin" | "editor" | null }): Promise<ActionResult> {
  const schema = z.object({ userId: z.uuid(), role: z.enum(["admin", "editor"]).nullable() });
  return runAction(
    schema,
    input,
    async ({ userId, role }, { supabase, user }) => {
      if (userId === user.id && role !== "admin") throw new UserError("No puedes quitarte a ti mismo el rol de administración.");
      const { error } = await supabase.rpc("set_user_role", { p_user_id: userId, p_role: role as "admin" });
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: role ? "Rol actualizado." : "Acceso retirado." };
    },
    "admin",
  );
}

/**
 * Invita a una persona por correo (requiere la clave secreta en el servidor).
 * Recibe un enlace para crear su contraseña; no hay registro público.
 */
export async function inviteUser(input: { email: string; role: "admin" | "editor" }): Promise<ActionResult> {
  const schema = z.object({ email: z.email("Correo no válido").max(254), role: z.enum(["admin", "editor"]) });
  return runAction(
    schema,
    input,
    async ({ email, role }, { supabase }) => {
      if (!isServiceRoleConfigured()) {
        throw new UserError("Para invitar usuarios desde el panel falta configurar SUPABASE_SECRET_KEY en el servidor. Mientras tanto, usa el script «npm run admin:create».");
      }
      const service = createServiceClient();
      const redirectTo = `${env.siteUrl}${getAdminBasePath()}/auth/confirm?next=${encodeURIComponent(`${getAdminBasePath()}/nueva-contrasena`)}`;
      const { data, error } = await service.auth.admin.inviteUserByEmail(email.toLowerCase(), { redirectTo });
      if (error || !data.user) {
        console.error("[invite]", error?.message);
        throw new UserError("No se ha podido enviar la invitación. Comprueba que el correo no esté ya registrado y que el envío de correos esté configurado en Supabase.");
      }
      const { error: e2 } = await supabase.rpc("set_user_role", { p_user_id: data.user.id, p_role: role });
      if (e2) throw new UserError(dbErrorMessage(e2));
      return { ok: true, message: `Invitación enviada a ${email}.` };
    },
    "admin",
  );
}

export async function updateOwnName(fullName: string): Promise<ActionResult> {
  return runAction(z.string().trim().max(120), fullName, async (name, { supabase }) => {
    const { error } = await supabase.rpc("update_own_profile", { p_full_name: sanitizePlain(name) });
    if (error) throw new UserError(dbErrorMessage(error));
    return { ok: true, message: "Nombre actualizado." };
  });
}
