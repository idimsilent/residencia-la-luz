import type { Metadata } from "next";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { GalleryBrowser } from "@/components/public/gallery-browser";
import { getActiveTheme, getPageBySlug } from "@/features/site/queries";
import { getGalleryCategories, listGalleryItems } from "@/features/gallery/queries";
import { pageMetadata } from "@/features/pages/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("instalaciones", "Instalaciones", "/instalaciones");
}

export default async function FacilitiesPage() {
  const [resolved, categories, items, theme] = await Promise.all([
    getPageBySlug("instalaciones"),
    getGalleryCategories(),
    listGalleryItems(),
    getActiveTheme(),
  ]);
  const blocks = resolved?.blocks ?? [];
  return (
    <>
      {blocks.length ? <BlocksRenderer blocks={blocks} /> : <PageHero eyebrow="Espacios" title="Instalaciones" />}
      <section className="container-site pb-20 pt-8">
        {items.length ? (
          <GalleryBrowser
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            items={items.map((i) => ({ id: i.id, media: i.media, caption: i.caption, categoryId: i.category_id }))}
            layout={theme.tokens.components.galleryStyle}
          />
        ) : (
          <p className="card mx-auto max-w-lg p-10 text-center text-muted">Pronto publicaremos fotografías de nuestras instalaciones.</p>
        )}
      </section>
    </>
  );
}
