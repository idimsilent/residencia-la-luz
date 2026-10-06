import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceBySlug, listPublishedServices } from "@/features/services/queries";
import { getMediaMap } from "@/features/site/queries";
import { mediaPublicUrl } from "@/features/media/url";
import { MediaImage } from "@/components/public/media-image";
import { Icon } from "@/components/public/icon";
import { sanitizeRichText } from "@/lib/sanitize";
import { SLUG_REGEX } from "@/lib/utils";
import { getPreview } from "@/lib/preview";

async function load(slug: string) {
  if (!SLUG_REGEX.test(slug)) return null;
  const s = await getServiceBySlug(slug);
  if (!s) return null;
  if (s.status !== "published" && !(await getPreview()).enabled) return null;
  return s;
}

export async function generateMetadata(props: PageProps<"/servicios/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const s = await load(slug);
  if (!s) return {};
  const media = await getMediaMap([s.media_id]);
  const img = s.media_id ? media.get(s.media_id) : null;
  return {
    title: s.title,
    description: s.summary || undefined,
    alternates: { canonical: `/servicios/${s.slug}` },
    openGraph: { title: s.title, description: s.summary, images: img ? [{ url: mediaPublicUrl(img.storage_path), alt: img.alt_text }] : undefined },
  };
}

export default async function ServiceDetail(props: PageProps<"/servicios/[slug]">) {
  const { slug } = await props.params;
  const s = await load(slug);
  if (!s) notFound();
  const [media, others] = await Promise.all([getMediaMap([s.media_id]), listPublishedServices()]);
  const img = s.media_id ? (media.get(s.media_id) ?? null) : null;
  return (
    <article className="pb-20">
      <header className="bg-surface-alt">
        <div className="container-site grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
          <div>
            <Link href="/servicios" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos los servicios
            </Link>
            <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-theme-sm bg-primary text-primary-contrast">
              <Icon name={s.icon} className="h-7 w-7" />
            </span>
            <h1 className="heading-1 mt-5">{s.title}</h1>
            {s.summary ? <p className="lead mt-4">{s.summary}</p> : null}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-theme-lg shadow-theme-lg">
            <MediaImage media={img} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </div>
      </header>
      <div className="container-site grid gap-12 py-12 lg:grid-cols-[3fr_1fr]">
        <div className="prose-site" dangerouslySetInnerHTML={{ __html: sanitizeRichText(s.content_html) }} />
        <aside>
          <div className="card p-6">
            <p className="font-heading text-xl">¿Tienes dudas?</p>
            <p className="mt-2 text-muted">Te explicamos sin compromiso cómo podemos ayudarte.</p>
            <Link href="/contacto" className="btn btn-primary mt-5 w-full">
              Solicitar información
            </Link>
          </div>
          {others.length > 1 ? (
            <nav aria-label="Otros servicios" className="mt-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">Otros servicios</p>
              <ul className="space-y-2">
                {others
                  .filter((o) => o.id !== s.id)
                  .slice(0, 6)
                  .map((o) => (
                    <li key={o.id}>
                      <Link href={`/servicios/${o.slug}`} className="flex items-center gap-3 rounded-theme-sm p-2 hover:bg-primary/10">
                        <Icon name={o.icon} className="h-5 w-5 text-primary" />
                        {o.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
