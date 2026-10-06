import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import type { Database } from "@/types/database";

export type GalleryCategory = Database["public"]["Tables"]["gallery_categories"]["Row"];
export type PublicGalleryItem = {
  id: string;
  caption: string;
  category_id: string | null;
  media: MediaLite;
};

export const getGalleryCategories = cache(async (): Promise<GalleryCategory[]> => {
  const db = createPublicClient();
  const { data } = await db.from("gallery_categories").select("*").order("sort_order").order("name");
  return data ?? [];
});

/** Elementos visibles de la galería (RLS oculta los no visibles). */
export const listGalleryItems = cache(async (limit = 200): Promise<PublicGalleryItem[]> => {
  const db = createPublicClient();
  const { data } = await db
    .from("gallery_items")
    .select(`id, caption, category_id, sort_order, media:media_id (${MEDIA_LITE_COLUMNS})`)
    .eq("is_visible", true)
    .order("sort_order")
    .limit(limit);
  return (data ?? [])
    .filter((row) => row.media)
    .map((row) => ({
      id: row.id,
      caption: row.caption,
      category_id: row.category_id,
      media: row.media as unknown as MediaLite,
    }));
});
