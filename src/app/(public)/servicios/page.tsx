import type { Metadata } from "next";
import Link from "next/link";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { Icon } from "@/components/public/icon";
import { MediaImage } from "@/components/public/media-image";
import { Reveal } from "@/components/public/reveal";
import { getMediaMap, getPageBySlug } from "@/features/site/queries";
import { listPublishedServices } from "@/features/services/queries";
import { pageMetadata } from "@/features/pages/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("servicios", "Servicios", "/servicios");
}

export default async function ServicesPage() {
  const [resolved, services] = await Promise.all([getPageBySlug("servicios"), listPublishedServices()]);
  const media = await getMediaMap(services.map((s) => s.media_id));
  const blocks = resolved?.blocks ?? [];
  return (
    <>
      {blocks.length ? <BlocksRenderer blocks={blocks} /> : <PageHero eyebrow="Qué ofrecemos" title="Servicios" />}
      <section className="container-site pb-20 pt-6">
        {services.length === 0 ? (
          <p className="card mx-auto max-w-lg p-10 text-center text-muted">Pronto publicaremos el detalle de nuestros servicios.</p>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 3) * 80}>
                <article className="card card-hover group relative flex h-full flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
                    <MediaImage media={s.media_id ? (media.get(s.media_id) ?? null) : null} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.04]" placeholderLabel="Imagen pendiente" />
                    <span className="absolute bottom-0 left-6 inline-flex h-14 w-14 translate-y-1/2 items-center justify-center rounded-theme-sm bg-surface text-primary shadow-theme">
                      <Icon name={s.icon} className="h-7 w-7" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-10">
                    <h2 className="text-2xl">
                      <Link href={`/servicios/${s.slug}`} className="after:absolute after:inset-0 hover:text-primary">
                        {s.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-muted">{s.summary}</p>
                    <span className="mt-auto pt-4 text-sm font-bold text-primary" aria-hidden="true">
                      Ver detalle →
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
