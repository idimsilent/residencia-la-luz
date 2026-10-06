import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { getPageBySlug, getSiteSettings } from "@/features/site/queries";
import { pageMetadata } from "@/features/pages/metadata";
import { SLUG_REGEX } from "@/lib/utils";

/** Páginas libres creadas en el CMS (Conócenos, legales, páginas nuevas…). */
const MODULE_SLUGS = new Set(["inicio", "servicios", "instalaciones", "noticias", "eventos", "contacto"]);

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  if (!SLUG_REGEX.test(slug) || MODULE_SLUGS.has(slug)) return {};
  return pageMetadata(slug, slug, `/${slug}`);
}

export default async function CmsPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  if (!SLUG_REGEX.test(slug) || MODULE_SLUGS.has(slug)) notFound();
  const [resolved, settings] = await Promise.all([getPageBySlug(slug), getSiteSettings()]);
  if (!resolved) notFound();
  const { page, blocks } = resolved;
  const startsWithHero = blocks[0]?.type === "hero" || blocks[0]?.type === "hero-split";
  return (
    <>
      {!startsWithHero ? <PageHero title={page.title} /> : null}
      {page.kind === "legal" && settings?.show_demo_notice ? (
        <div className="container-site">
          <p className="mx-auto mt-8 max-w-3xl rounded-theme border border-accent/40 bg-accent/10 p-4 text-sm">
            Texto pendiente de revisión jurídica. Este contenido es orientativo y debe ser revisado y completado por un
            profesional antes de publicar la web.
          </p>
        </div>
      ) : null}
      <BlocksRenderer blocks={blocks} />
    </>
  );
}
