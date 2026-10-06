import type { MetadataRoute } from "next";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

const MODULE_PAGES = ["servicios", "instalaciones", "noticias", "eventos", "contacto"];

/** Mapa del sitio con el contenido publicado (RLS excluye borradores y programadas). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...MODULE_PAGES.map((p) => ({ url: `${base}/${p}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
  if (!isSupabaseConfigured()) return entries;

  const db = createPublicClient();
  const [pages, news, events, services] = await Promise.all([
    db.from("pages").select("slug, updated_at").eq("status", "published"),
    db.from("news_posts").select("slug, updated_at").eq("status", "published").lte("published_at", new Date().toISOString()).limit(1000),
    db.from("events").select("slug, updated_at").eq("status", "published").eq("has_detail_page", true).limit(1000),
    db.from("services").select("slug, updated_at").eq("status", "published"),
  ]);
  for (const p of pages.data ?? []) {
    if (p.slug === "inicio" || MODULE_PAGES.includes(p.slug)) continue;
    entries.push({ url: `${base}/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const n of news.data ?? []) entries.push({ url: `${base}/noticias/${n.slug}`, lastModified: n.updated_at, changeFrequency: "monthly", priority: 0.6 });
  for (const e of events.data ?? []) entries.push({ url: `${base}/eventos/${e.slug}`, lastModified: e.updated_at, changeFrequency: "weekly", priority: 0.5 });
  for (const s of services.data ?? []) entries.push({ url: `${base}/servicios/${s.slug}`, lastModified: s.updated_at, changeFrequency: "monthly", priority: 0.6 });
  return entries;
}
