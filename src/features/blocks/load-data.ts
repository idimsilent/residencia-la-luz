import "server-only";
import { collectBlockMediaIds, type AnyBlock } from "./schema";
import type { BlockData } from "./data";
import { getMediaMap, getSiteSettings, parseOpeningHours } from "@/features/site/queries";
import { getNewsCategories, listRecentNews } from "@/features/news/queries";
import { getEventCategories, listUpcomingEvents } from "@/features/events/queries";
import { listPublishedServices } from "@/features/services/queries";
import { listGalleryItems } from "@/features/gallery/queries";
import { listPublishedTestimonials } from "@/features/testimonials/queries";

/** Carga en servidor solo los datos que necesitan los bloques presentes. */
export async function loadBlockData(blocks: AnyBlock[], opts: { everything?: boolean } = {}): Promise<BlockData> {
  const types = new Set(blocks.map((b) => b.type));
  const need = (t: AnyBlock["type"]) => opts.everything || types.has(t);
  const maxLimit = (t: AnyBlock["type"], fallback: number) =>
    opts.everything
      ? 12
      : Math.max(fallback, ...blocks.filter((b) => b.type === t).map((b) => ("limit" in b.props ? Number(b.props.limit) : fallback)));

  const [settings, newsRaw, newsCats, eventsRaw, eventCats, services, gallery, testimonials] = await Promise.all([
    getSiteSettings(),
    need("news") ? listRecentNews(maxLimit("news", 3)) : Promise.resolve([]),
    need("news") ? getNewsCategories() : Promise.resolve([]),
    need("events") ? listUpcomingEvents(maxLimit("events", 3)) : Promise.resolve([]),
    need("events") ? getEventCategories() : Promise.resolve([]),
    need("services") ? listPublishedServices(maxLimit("services", 6)) : Promise.resolve([]),
    need("gallery") ? listGalleryItems(opts.everything ? 24 : maxLimit("gallery", 8)) : Promise.resolve([]),
    need("testimonials") ? listPublishedTestimonials(maxLimit("testimonials", 3)) : Promise.resolve([]),
  ]);

  const mediaIds = [
    ...collectBlockMediaIds(blocks),
    ...newsRaw.map((n) => n.featured_media_id),
    ...services.map((s) => s.media_id),
  ];
  const mediaMap = await getMediaMap(mediaIds);
  const media: BlockData["media"] = {};
  for (const [id, m] of mediaMap) media[id] = m;
  for (const g of gallery) media[g.media.id] = g.media;

  const newsCatMap = new Map(newsCats.map((c) => [c.id, c.name]));
  const eventCatMap = new Map(eventCats.map((c) => [c.id, c]));

  return {
    media,
    news: newsRaw.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      published_at: n.published_at,
      is_featured: n.is_featured,
      categoryName: n.category_id ? (newsCatMap.get(n.category_id) ?? null) : null,
      mediaId: n.featured_media_id,
    })),
    events: eventsRaw.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      summary: e.summary,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      all_day: e.all_day,
      location: e.location,
      categoryName: e.category_id ? (eventCatMap.get(e.category_id)?.name ?? null) : null,
      categoryColor: e.category_id ? (eventCatMap.get(e.category_id)?.color ?? null) : null,
      has_detail_page: e.has_detail_page,
      external_url: e.external_url,
    })),
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      summary: s.summary,
      icon: s.icon,
      mediaId: s.media_id,
    })),
    gallery: gallery.map((g) => ({ id: g.id, caption: g.caption, mediaId: g.media.id })),
    testimonials,
    contact: {
      phone: settings?.phone ?? "",
      email: settings?.email ?? "",
      address: [
        settings?.address_line,
        [settings?.postal_code, settings?.city].filter(Boolean).join(" "),
        settings?.province,
      ].filter((v): v is string => Boolean(v)),
      hours: parseOpeningHours(settings?.opening_hours),
      mapUrl: settings?.map_url ?? null,
      formEnabled: settings?.contact_form_enabled ?? false,
      privacyNote: settings?.contact_privacy_note ?? "",
    },
    testimonialsEnabled: settings?.testimonials_enabled ?? false,
  };
}
