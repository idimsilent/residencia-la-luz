import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getReader } from "@/features/site/queries";
import type { Database } from "@/types/database";

export type Service = Database["public"]["Tables"]["services"]["Row"];

export const listPublishedServices = cache(async (limit = 50): Promise<Service[]> => {
  const db = createPublicClient();
  const { data } = await db
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .limit(limit);
  return data ?? [];
});

export const getServiceBySlug = cache(async (slug: string) => {
  const db = await getReader();
  const { data } = await db.from("services").select("*").eq("slug", slug).maybeSingle();
  return data;
});
