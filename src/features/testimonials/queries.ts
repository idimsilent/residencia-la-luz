import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

/** Solo testimonios publicados con consentimiento confirmado (también lo exige RLS). */
export async function listPublishedTestimonials(limit: number) {
  const db = createPublicClient();
  const { data } = await db
    .from("testimonials")
    .select("id, quote, author_label")
    .eq("status", "published")
    .eq("consent_confirmed", true)
    .order("sort_order")
    .limit(limit);
  return data ?? [];
}
