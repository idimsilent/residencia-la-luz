import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getReader } from "@/features/site/queries";
import type { Database } from "@/types/database";

export type NewsPost = Database["public"]["Tables"]["news_posts"]["Row"];
export type NewsCategory = Database["public"]["Tables"]["news_categories"]["Row"];

export type NewsListItem = Pick<
  NewsPost,
  "id" | "title" | "slug" | "excerpt" | "published_at" | "is_featured" | "author_name" | "featured_media_id" | "category_id" | "is_demo"
>;

const LIST_COLUMNS =
  "id, title, slug, excerpt, published_at, is_featured, author_name, featured_media_id, category_id, is_demo";

export const NEWS_PAGE_SIZE = 8;

export const getNewsCategories = cache(async (): Promise<NewsCategory[]> => {
  const db = createPublicClient();
  const { data } = await db.from("news_categories").select("*").order("sort_order").order("name");
  return data ?? [];
});

/** Listado público. RLS ya excluye borradores, archivadas y programadas. */
export async function listPublishedNews(opts: {
  page?: number;
  categoryId?: string | null;
  search?: string | null;
  limit?: number;
  onlyFeatured?: boolean;
}): Promise<{ items: NewsListItem[]; total: number }> {
  const db = createPublicClient();
  const limit = opts.limit ?? NEWS_PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  let q = db
    .from("news_posts")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts.onlyFeatured) q = q.eq("is_featured", true);
  if (opts.search) {
    q = q.textSearch("search", opts.search, { type: "websearch", config: "spanish" });
  }
  const { data, count } = await q;
  return { items: data ?? [], total: count ?? 0 };
}

/** Noticias recientes estrictamente cronológicas (para portada y bloques). */
export async function listRecentNews(limit: number, onlyFeatured = false): Promise<NewsListItem[]> {
  const db = createPublicClient();
  let q = db
    .from("news_posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (onlyFeatured) q = q.eq("is_featured", true);
  const { data } = await q;
  return data ?? [];
}

export const getNewsBySlug = cache(async (slug: string) => {
  const db = await getReader();
  const { data: post } = await db.from("news_posts").select("*").eq("slug", slug).maybeSingle();
  if (!post) return null;
  const { data: gallery } = await db
    .from("news_post_media")
    .select("media_id, sort_order")
    .eq("post_id", post.id)
    .order("sort_order");
  return { post, galleryIds: (gallery ?? []).map((g) => g.media_id) };
});
