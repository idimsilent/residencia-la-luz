"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { newsInputSchema, quickPostSchema } from "./schema";
import { sanitizePlain, sanitizeRichText } from "@/lib/sanitize";
import { madridLocalToUtcIso } from "@/lib/dates";
import { slugify, stripHtml, truncate } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type Db = SupabaseClient<Database>;

/** Garantiza un slug único añadiendo -2, -3… si ya existe. */
async function uniqueSlug(db: Db, table: "news_posts" | "events" | "services" | "pages", base: string, excludeId?: string) {
  const root = (base || "publicacion").slice(0, 90);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = db.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q;
    if (!data?.length) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function revalidateNews(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/noticias/${slug}`);
}

export async function saveNews(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(newsInputSchema, input, async (d, { supabase, user }) => {
    const content = sanitizeRichText(d.content_html);
    const slug = await uniqueSlug(supabase, "news_posts", d.slug || slugify(d.title), d.id);
    const excerpt = d.excerpt ? sanitizePlain(d.excerpt) : truncate(stripHtml(content), 220);

    let existing: { status: string; published_at: string | null } | null = null;
    if (d.id) {
      const { data } = await supabase.from("news_posts").select("status, published_at").eq("id", d.id).maybeSingle();
      if (!data) throw new UserError("La noticia ya no existe.");
      existing = data;
    }

    let status: "draft" | "published" | "archived";
    let published_at: string | null = existing?.published_at ?? null;
    const now = new Date();
    switch (d.mode) {
      case "draft":
        status = "draft";
        break;
      case "archive":
        status = "archived";
        break;
      case "publish":
        status = "published";
        // Mantiene la fecha original si ya estaba publicada en el pasado.
        if (!(existing?.status === "published" && published_at && new Date(published_at) <= now)) {
          published_at = now.toISOString();
        }
        break;
      case "schedule": {
        status = "published";
        published_at = madridLocalToUtcIso(d.scheduled_date!, d.scheduled_time!);
        if (new Date(published_at) <= now) {
          throw new UserError("La fecha programada debe ser posterior a la actual. Usa «Publicar ahora» para publicar ya.");
        }
        break;
      }
    }

    const row = {
      title: sanitizePlain(d.title),
      slug,
      excerpt,
      content_html: content,
      featured_media_id: d.featured_media_id,
      category_id: d.category_id,
      author_name: d.author_name ? sanitizePlain(d.author_name) : null,
      status,
      published_at,
      is_featured: d.is_featured,
      seo_title: d.seo_title || null,
      seo_description: d.seo_description || null,
      updated_by: user.id,
      is_demo: false,
    };

    let id = d.id;
    if (id) {
      const { error } = await supabase.from("news_posts").update(row).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
    } else {
      const { data, error } = await supabase.from("news_posts").insert({ ...row, created_by: user.id }).select("id").single();
      if (error) throw new UserError(dbErrorMessage(error));
      id = data.id;
    }

    // Fotografías de la noticia: se reemplaza la lista completa.
    await supabase.from("news_post_media").delete().eq("post_id", id);
    if (d.gallery_ids.length) {
      const { error } = await supabase
        .from("news_post_media")
        .insert([...new Set(d.gallery_ids)].map((media_id, i) => ({ post_id: id!, media_id, sort_order: i })));
      if (error) throw new UserError(dbErrorMessage(error));
    }

    revalidateNews(slug);
    const message =
      d.mode === "draft" ? "Borrador guardado." : d.mode === "archive" ? "Noticia archivada." : d.mode === "schedule" ? "Publicación programada." : "Noticia publicada.";
    return { ok: true, message, data: { id, slug } };
  });
}

/** Publicación rápida "estilo Twitter": título, texto, foto y listo. */
export async function quickPost(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(quickPostSchema, input, async (d, { supabase, user }) => {
    const title = sanitizePlain(d.title);
    const paragraphs = sanitizePlain(d.text)
      .split(/\n{2,}|\r\n\r\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`)
      .join("");
    const slug = await uniqueSlug(supabase, "news_posts", slugify(title));
    const { data, error } = await supabase
      .from("news_posts")
      .insert({
        title,
        slug,
        excerpt: truncate(sanitizePlain(d.text).replace(/\s+/g, " "), 220),
        content_html: sanitizeRichText(paragraphs),
        featured_media_id: d.media_id,
        category_id: d.category_id,
        status: d.publish ? "published" : "draft",
        published_at: d.publish ? new Date().toISOString() : null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id, slug")
      .single();
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateNews(slug);
    return { ok: true, message: d.publish ? "¡Publicada! Ya aparece en la web." : "Borrador guardado.", data };
  });
}

export async function duplicateNews(id: string): Promise<ActionResult<{ id: string }>> {
  return runAction(z.uuid(), id, async (newsId, { supabase, user }) => {
    const { data: src } = await supabase.from("news_posts").select("*").eq("id", newsId).maybeSingle();
    if (!src) throw new UserError("La noticia no existe.");
    const slug = await uniqueSlug(supabase, "news_posts", `${src.slug}-copia`);
    const { data, error } = await supabase
      .from("news_posts")
      .insert({
        title: `${src.title} (copia)`.slice(0, 200),
        slug,
        excerpt: src.excerpt,
        content_html: src.content_html,
        featured_media_id: src.featured_media_id,
        category_id: src.category_id,
        author_name: src.author_name,
        status: "draft",
        published_at: null,
        is_featured: false,
        seo_title: src.seo_title,
        seo_description: src.seo_description,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new UserError(dbErrorMessage(error));
    const { data: photos } = await supabase.from("news_post_media").select("media_id, sort_order").eq("post_id", newsId);
    if (photos?.length) await supabase.from("news_post_media").insert(photos.map((p) => ({ ...p, post_id: data.id })));
    revalidatePath("/", "layout");
    return { ok: true, message: "Copia creada como borrador.", data };
  });
}

const idsSchema = z.array(z.uuid()).min(1).max(200);

export async function deleteNews(ids: string[]): Promise<ActionResult> {
  return runAction(idsSchema, ids, async (list, { supabase }) => {
    const { error } = await supabase.from("news_posts").delete().in("id", list);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateNews();
    return { ok: true, message: list.length === 1 ? "Noticia eliminada." : `${list.length} noticias eliminadas.` };
  });
}

/** Acciones masivas de estado. */
export async function setNewsStatus(input: { ids: string[]; status: "draft" | "published" | "archived" }): Promise<ActionResult> {
  const schema = z.object({ ids: idsSchema, status: z.enum(["draft", "published", "archived"]) });
  return runAction(schema, input, async ({ ids, status }, { supabase, user }) => {
    if (status === "published") {
      // Las que no tengan fecha se publican ahora; las programadas conservan su fecha.
      const { error: e1 } = await supabase
        .from("news_posts")
        .update({ status, published_at: new Date().toISOString(), updated_by: user.id })
        .in("id", ids)
        .is("published_at", null);
      if (e1) throw new UserError(dbErrorMessage(e1));
    }
    const { error } = await supabase.from("news_posts").update({ status, updated_by: user.id }).in("id", ids);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateNews();
    const label = { draft: "pasadas a borrador", published: "publicadas", archived: "archivadas" }[status];
    return { ok: true, message: `${ids.length} ${ids.length === 1 ? "noticia" : "noticias"} ${label}.` };
  });
}
