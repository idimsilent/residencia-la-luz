"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import type { ActionResult } from "@/lib/action-result";

function revalidateGallery() {
  revalidatePath("/", "layout");
}

export async function addToGallery(input: { mediaIds: string[]; categoryId: string | null }): Promise<ActionResult> {
  const schema = z.object({ mediaIds: z.array(z.uuid()).min(1).max(100), categoryId: z.uuid().nullable() });
  return runAction(schema, input, async ({ mediaIds, categoryId }, { supabase }) => {
    const { data: existing } = await supabase.from("gallery_items").select("media_id, sort_order").order("sort_order", { ascending: false });
    const already = new Set((existing ?? []).map((e) => e.media_id));
    let order = existing?.[0]?.sort_order ?? 0;
    const rows = mediaIds.filter((id) => !already.has(id)).map((media_id) => ({ media_id, category_id: categoryId, sort_order: (order += 10) }));
    if (!rows.length) return { ok: true, message: "Esas imágenes ya estaban en la galería." };
    const { error } = await supabase.from("gallery_items").insert(rows);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateGallery();
    return { ok: true, message: rows.length === 1 ? "Imagen añadida a la galería." : `${rows.length} imágenes añadidas a la galería.` };
  });
}

export async function updateGalleryItem(input: { id: string; caption: string; category_id: string | null; is_visible: boolean }): Promise<ActionResult> {
  const schema = z.object({ id: z.uuid(), caption: z.string().trim().max(300), category_id: z.uuid().nullable(), is_visible: z.boolean() });
  return runAction(schema, input, async ({ id, ...row }, { supabase }) => {
    const { error } = await supabase.from("gallery_items").update(row).eq("id", id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateGallery();
    return { ok: true, message: "Galería actualizada." };
  });
}

export async function reorderGallery(ids: string[]): Promise<ActionResult> {
  return runAction(z.array(z.uuid()).min(1).max(500), ids, async (list, { supabase }) => {
    for (const [i, id] of list.entries()) {
      const { error } = await supabase.from("gallery_items").update({ sort_order: (i + 1) * 10 }).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
    }
    revalidateGallery();
    return { ok: true, message: "Orden guardado." };
  });
}

export async function removeFromGallery(id: string): Promise<ActionResult> {
  return runAction(z.uuid(), id, async (itemId, { supabase }) => {
    const { error } = await supabase.from("gallery_items").delete().eq("id", itemId);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateGallery();
    return { ok: true, message: "Quitada de la galería (la imagen sigue en la biblioteca)." };
  });
}
