import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getReader } from "@/features/site/queries";
import type { Database } from "@/types/database";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventCategory = Database["public"]["Tables"]["event_categories"]["Row"];

export type EventListItem = Pick<
  EventRow,
  | "id" | "title" | "slug" | "summary" | "starts_at" | "ends_at" | "all_day" | "location"
  | "media_id" | "category_id" | "is_featured" | "has_detail_page" | "external_url" | "is_demo"
>;

const LIST_COLUMNS =
  "id, title, slug, summary, starts_at, ends_at, all_day, location, media_id, category_id, is_featured, has_detail_page, external_url, is_demo";

export const getEventCategories = cache(async (): Promise<EventCategory[]> => {
  const db = createPublicClient();
  const { data } = await db.from("event_categories").select("*").order("sort_order").order("name");
  return data ?? [];
});

/** Eventos publicados que se solapan con el rango [from, to]. RLS excluye borradores. */
export async function listEventsInRange(from: string, to: string, categoryId?: string | null): Promise<EventListItem[]> {
  const db = createPublicClient();
  let q = db
    .from("events")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .lte("starts_at", to)
    .gte("ends_at", from)
    .order("starts_at");
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data } = await q;
  return data ?? [];
}

export async function listUpcomingEvents(limit: number, categoryId?: string | null): Promise<EventListItem[]> {
  const db = createPublicClient();
  let q = db
    .from("events")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at")
    .limit(limit);
  if (categoryId) q = q.eq("category_id", categoryId);
  const { data } = await q;
  return data ?? [];
}

export const getEventBySlug = cache(async (slug: string) => {
  const db = await getReader();
  const { data } = await db.from("events").select("*").eq("slug", slug).maybeSingle();
  return data;
});
