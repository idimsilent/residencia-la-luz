"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "./url";
import type { ActionResult } from "@/lib/action-result";

export type MediaItem = MediaLite & {
  file_name: string;
  description: string;
  tags: string[];
  size_bytes: number;
  created_at: string;
  usage: number;
};

export type MediaUsage = { kind: string; ref_id: string | null; ref_title: string };

const PAGE_SIZE = 48;

/** Listado para la biblioteca y el selector de imágenes. */
export async function listMedia(input: { search?: string; tag?: string; page?: number }): Promise<ActionResult<{ items: MediaItem[]; total: number; tags: string[] }>> {
  const schema = z.object({
    search: z.string().max(80).optional(),
    tag: z.string().max(40).optional(),
    page: z.number().int().min(1).max(1000).optional(),
  });
  return runAction(schema, input, async (data, { supabase }) => {
    const page = data.page ?? 1;
    let q = supabase
      .from("media")
      .select(`${MEDIA_LITE_COLUMNS}, file_name, description, tags, size_bytes, created_at`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (data.search) {
      const term = data.search.replace(/[%_,()]/g, " ").trim();
      if (term) q = q.or(`title.ilike.%${term}%,file_name.ilike.%${term}%,alt_text.ilike.%${term}%`);
    }
    if (data.tag) q = q.contains("tags", [data.tag]);
    const [{ data: rows, count, error }, { data: usage }, { data: tagRows }] = await Promise.all([
      q,
      supabase.from("media_usage").select("media_id, kind, ref_id, ref_title"),
      supabase.from("media").select("tags"),
    ]);
    if (error) throw new UserError(dbErrorMessage(error));
    // Cuenta sitios distintos (una página con borrador y versión publicada cuenta una vez).
    const counts = new Map<string, number>();
    const seen = new Set<string>();
    for (const u of usage ?? []) {
      if (!u.media_id) continue;
      const key = `${u.media_id}:${u.kind}:${u.ref_id ?? u.ref_title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(u.media_id, (counts.get(u.media_id) ?? 0) + 1);
    }
    const tags = [...new Set((tagRows ?? []).flatMap((r) => r.tags))].sort();
    return {
      ok: true,
      data: {
        items: (rows ?? []).map((r) => ({ ...r, usage: counts.get(r.id) ?? 0 })),
        total: count ?? 0,
        tags,
      },
    };
  });
}

export async function getMediaUsage(id: string): Promise<ActionResult<MediaUsage[]>> {
  return runAction(z.uuid(), id, async (mediaId, { supabase }) => {
    const { data, error } = await supabase.from("media_usage").select("kind, ref_id, ref_title").eq("media_id", mediaId);
    if (error) throw new UserError(dbErrorMessage(error));
    // Elimina duplicados (una noticia puede usar la imagen varias veces).
    const seen = new Set<string>();
    const unique = (data ?? []).filter((u) => {
      const key = `${u.kind}:${u.ref_id}:${u.ref_title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }) as MediaUsage[];
    return { ok: true, data: unique };
  });
}

const updateSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(160),
  alt_text: z.string().trim().max(300),
  description: z.string().trim().max(1000),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40).regex(/^[\p{L}\p{N} -]+$/u)).max(12),
});

export async function updateMedia(input: z.input<typeof updateSchema>): Promise<ActionResult> {
  return runAction(updateSchema, input, async (data, { supabase }) => {
    const { error } = await supabase
      .from("media")
      .update({ title: data.title, alt_text: data.alt_text, description: data.description, tags: [...new Set(data.tags)] })
      .eq("id", data.id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidatePath("/", "layout");
    return { ok: true, message: "Cambios guardados." };
  });
}

/**
 * Borrado de imagen. Si está en uso, se exige confirmación explícita (force).
 * Con force: se retira de la galería y de las fotos de noticias; el resto de
 * referencias quedan vacías (la web muestra un hueco neutro).
 */
export async function deleteMedia(input: { id: string; force?: boolean }): Promise<ActionResult<{ usage?: MediaUsage[] }>> {
  return runAction(z.object({ id: z.uuid(), force: z.boolean().optional() }), input, async (data, { supabase }) => {
    const { data: media } = await supabase.from("media").select("id, storage_path, is_demo").eq("id", data.id).maybeSingle();
    if (!media) throw new UserError("La imagen ya no existe.");
    const { data: usage } = await supabase.from("media_usage").select("kind, ref_id, ref_title").eq("media_id", data.id);
    if (usage && usage.length > 0 && !data.force) {
      return { ok: false, error: "Esta imagen se está usando. Confirma el borrado o sustitúyela antes.", data: undefined, fieldErrors: undefined };
    }
    await supabase.from("gallery_items").delete().eq("media_id", data.id);
    await supabase.from("news_post_media").delete().eq("media_id", data.id);
    const { error } = await supabase.from("media").delete().eq("id", data.id);
    if (error) throw new UserError(dbErrorMessage(error));
    if (!media.is_demo && !media.storage_path.startsWith("demo/")) {
      const { error: storageError } = await supabase.storage.from("media").remove([media.storage_path]);
      if (storageError) console.error("[media] remove", storageError.message);
    }
    revalidatePath("/", "layout");
    return { ok: true, message: "Imagen eliminada." };
  });
}

export async function replaceMedia(input: { fromId: string; toId: string }): Promise<ActionResult> {
  return runAction(z.object({ fromId: z.uuid(), toId: z.uuid() }), input, async (data, { supabase }) => {
    const { error } = await supabase.rpc("replace_media", { p_from: data.fromId, p_to: data.toId });
    if (error) throw new UserError(dbErrorMessage(error));
    revalidatePath("/", "layout");
    return { ok: true, message: "Imagen sustituida en todos sus usos." };
  });
}
