import "server-only";
import type { Metadata } from "next";
import { getMediaMap, getPageBySlug } from "@/features/site/queries";
import { mediaPublicUrl } from "@/features/media/url";

/** Metadatos SEO de una página gestionada desde el CMS. */
export async function pageMetadata(slug: string, fallbackTitle: string, path: string): Promise<Metadata> {
  const resolved = await getPageBySlug(slug);
  const page = resolved?.page;
  const media = await getMediaMap([page?.og_media_id]);
  const og = page?.og_media_id ? media.get(page.og_media_id) : null;
  const title = page?.seo_title || page?.title || fallbackTitle;
  return {
    title: slug === "inicio" ? { absolute: title } : title,
    description: page?.seo_description || undefined,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: page?.seo_description || undefined,
      url: path,
      images: og ? [{ url: mediaPublicUrl(og.storage_path), alt: og.alt_text }] : undefined,
    },
    robots: resolved?.isPreview ? { index: false } : undefined,
  };
}
