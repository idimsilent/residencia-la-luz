"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { parseBlocks, type AnyBlock } from "@/features/blocks/schema";
import { sanitizePlain, sanitizeRichText } from "@/lib/sanitize";
import { slugify, SLUG_REGEX } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";

/** Rutas que ya usa la aplicación y no pueden ser páginas libres. */
const RESERVED_SLUGS = new Set([
  "api", "noticias", "eventos", "servicios", "instalaciones", "contacto", "panel-interno", "gestion-centro",
  "acceso", "sitemap", "robots", "demo", "_next", "inicio",
]);

function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Sanea el HTML de los bloques de texto antes de guardarlos. */
function cleanBlocks(blocks: AnyBlock[]) {
  return blocks.map((b) => {
    const props = b.type === "rich-text" || b.type === "image-text" ? { ...b.props, html: sanitizeRichText(b.props.html) } : b.props;
    return { type: b.type, props, isHidden: b.isHidden, visibility: b.visibility, schemaVersion: b.schemaVersion };
  });
}

const draftSchema = z.object({ pageId: z.uuid(), blocks: z.array(z.unknown()).max(60) });

export async function savePageDraft(input: { pageId: string; blocks: unknown[] }): Promise<ActionResult<{ savedAt: string }>> {
  return runAction(draftSchema, input, async ({ pageId, blocks }, { supabase }) => {
    const parsed = parseBlocks(blocks);
    if (!parsed.ok) {
      const e = parsed.errors[0];
      throw new UserError(e.index >= 0 ? `El bloque ${e.index + 1} tiene un dato no válido (${e.message}).` : e.message);
    }
    const { error } = await supabase.rpc("save_page_draft", { p_page_id: pageId, p_blocks: cleanBlocks(parsed.blocks) });
    if (error) throw new UserError(dbErrorMessage(error));
    return { ok: true, message: "Borrador guardado.", data: { savedAt: new Date().toISOString() } };
  });
}

export async function publishPage(input: { pageId: string; blocks: unknown[]; note?: string }): Promise<ActionResult> {
  const schema = draftSchema.extend({ note: z.string().trim().max(200).optional() });
  return runAction(schema, input, async ({ pageId, blocks, note }, { supabase }) => {
    const parsed = parseBlocks(blocks);
    if (!parsed.ok) {
      const e = parsed.errors[0];
      throw new UserError(e.index >= 0 ? `El bloque ${e.index + 1} tiene un dato no válido (${e.message}).` : e.message);
    }
    const { error: e1 } = await supabase.rpc("save_page_draft", { p_page_id: pageId, p_blocks: cleanBlocks(parsed.blocks) });
    if (e1) throw new UserError(dbErrorMessage(e1));
    const { error } = await supabase.rpc("publish_page", { p_page_id: pageId, p_note: note ? sanitizePlain(note) : undefined });
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "¡Página publicada! Los cambios ya se ven en la web." };
  });
}

export async function discardPageDraft(pageId: string): Promise<ActionResult> {
  return runAction(z.uuid(), pageId, async (id, { supabase }) => {
    const { error } = await supabase.rpc("discard_page_draft", { p_page_id: id });
    if (error) throw new UserError(dbErrorMessage(error));
    return { ok: true, message: "Cambios descartados. Se ha recuperado la versión publicada." };
  });
}

export async function restorePageRevision(revisionId: string): Promise<ActionResult> {
  return runAction(z.uuid(), revisionId, async (id, { supabase }) => {
    const { error } = await supabase.rpc("restore_page_revision", { p_revision_id: id });
    if (error) throw new UserError(dbErrorMessage(error));
    return { ok: true, message: "Versión recuperada como borrador. Revísala y publícala si es correcta." };
  });
}

const settingsSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1, "Escribe un título").max(160),
  slug: z.string().trim().max(80).regex(SLUG_REGEX, "Solo minúsculas, números y guiones"),
  seo_title: z.string().trim().max(70, "Máximo 70 caracteres"),
  seo_description: z.string().trim().max(170, "Máximo 170 caracteres"),
  og_media_id: z.uuid().nullable(),
});

export async function updatePageSettings(input: z.input<typeof settingsSchema>): Promise<ActionResult<{ slug: string }>> {
  return runAction(settingsSchema, input, async (d, { supabase }) => {
    const { data: page } = await supabase.from("pages").select("is_system, slug").eq("id", d.id).maybeSingle();
    if (!page) throw new UserError("La página no existe.");
    if (!page.is_system && RESERVED_SLUGS.has(d.slug)) throw new UserError("Esa dirección está reservada por la web. Elige otra.");
    const slug = page.is_system ? page.slug : d.slug;
    const { error } = await supabase
      .from("pages")
      .update({ title: sanitizePlain(d.title), slug, seo_title: d.seo_title || null, seo_description: d.seo_description || null, og_media_id: d.og_media_id })
      .eq("id", d.id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "Ajustes de la página guardados.", data: { slug } };
  });
}

export async function createPage(input: { title: string; slug: string }): Promise<ActionResult<{ id: string }>> {
  const schema = z.object({
    title: z.string().trim().min(1, "Escribe un título").max(160),
    slug: z.string().trim().max(80).regex(SLUG_REGEX, "Solo minúsculas, números y guiones").or(z.literal("")),
  });
  return runAction(schema, input, async (d, { supabase }) => {
    const slug = d.slug || slugify(d.title);
    if (!slug || RESERVED_SLUGS.has(slug)) throw new UserError("Esa dirección está reservada por la web. Elige otra.");
    const { data, error } = await supabase
      .from("pages")
      .insert({ title: sanitizePlain(d.title), slug, kind: "blocks", is_system: false, status: "draft", has_unpublished_changes: true })
      .select("id")
      .single();
    if (error) throw new UserError(dbErrorMessage(error));
    const starter = [
      {
        type: "hero-split",
        props: { title: sanitizePlain(d.title), subtitle: "Escribe aquí una introducción.", style: {} },
        isHidden: false,
        visibility: { desktop: true, tablet: true, mobile: true },
        schemaVersion: 1,
      },
    ];
    const parsed = parseBlocks(starter);
    if (parsed.ok) await supabase.rpc("save_page_draft", { p_page_id: data.id, p_blocks: cleanBlocks(parsed.blocks) });
    return { ok: true, message: "Página creada como borrador.", data };
  });
}

export async function duplicatePage(pageId: string): Promise<ActionResult<{ id: string }>> {
  return runAction(z.uuid(), pageId, async (id, { supabase }) => {
    const { data: src } = await supabase.from("pages").select("title, slug, seo_title, seo_description, og_media_id").eq("id", id).maybeSingle();
    if (!src) throw new UserError("La página no existe.");
    let slug = `${src.slug}-copia`.slice(0, 80);
    for (let i = 2; i < 30; i++) {
      const { data } = await supabase.from("pages").select("id").eq("slug", slug).limit(1);
      if (!data?.length) break;
      slug = `${src.slug}-copia-${i}`.slice(0, 80);
    }
    const { data: page, error } = await supabase
      .from("pages")
      .insert({ title: `${src.title} (copia)`.slice(0, 160), slug, kind: "blocks", is_system: false, status: "draft", seo_title: src.seo_title, seo_description: src.seo_description, og_media_id: src.og_media_id, has_unpublished_changes: true })
      .select("id")
      .single();
    if (error) throw new UserError(dbErrorMessage(error));
    const { data: blocks } = await supabase.from("page_blocks").select("type, props, is_hidden, visibility, schema_version").eq("page_id", id).is("revision_id", null).order("position");
    const payload = (blocks ?? []).map((b) => ({ type: b.type, props: b.props, isHidden: b.is_hidden, visibility: b.visibility, schemaVersion: b.schema_version }));
    if (payload.length) await supabase.rpc("save_page_draft", { p_page_id: page.id, p_blocks: payload });
    return { ok: true, message: "Copia creada como borrador.", data: page };
  });
}

export async function deletePage(pageId: string): Promise<ActionResult> {
  return runAction(
    z.uuid(),
    pageId,
    async (id, { supabase }) => {
      const { data: page } = await supabase.from("pages").select("is_system, slug").eq("id", id).maybeSingle();
      if (!page) throw new UserError("La página no existe.");
      if (page.is_system) throw new UserError("Las páginas principales de la web no se pueden borrar.");
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
      // Quita los enlaces del menú que apuntaban a ella.
      await supabase.from("menu_items").delete().eq("href", `/${page.slug}`).eq("is_system", false);
      revalidateSite();
      return { ok: true, message: "Página eliminada." };
    },
    "admin",
  );
}

export async function unpublishPage(pageId: string): Promise<ActionResult> {
  return runAction(z.uuid(), pageId, async (id, { supabase }) => {
    const { data: page } = await supabase.from("pages").select("is_system").eq("id", id).maybeSingle();
    if (!page) throw new UserError("La página no existe.");
    if (page.is_system) throw new UserError("Las páginas principales no se pueden despublicar; edita su contenido.");
    const { error } = await supabase.from("pages").update({ status: "draft" }).eq("id", id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateSite();
    return { ok: true, message: "La página ya no se muestra en la web." };
  });
}
