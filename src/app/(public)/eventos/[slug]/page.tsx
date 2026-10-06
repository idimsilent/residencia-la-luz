import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Clock, MapPin } from "lucide-react";
import { getEventBySlug, getEventCategories } from "@/features/events/queries";
import { getMediaMap, getSiteSettings } from "@/features/site/queries";
import { mediaPublicUrl } from "@/features/media/url";
import { MediaImage } from "@/components/public/media-image";
import { ShareButtons } from "@/components/public/share-buttons";
import { JsonLd } from "@/components/public/json-ld";
import { eventTimeLabel } from "@/components/public/event-card";
import { formatMadrid } from "@/lib/dates";
import { sanitizeRichText } from "@/lib/sanitize";
import { env } from "@/lib/env";
import { SLUG_REGEX } from "@/lib/utils";
import { getPreview } from "@/lib/preview";

async function load(slug: string) {
  if (!SLUG_REGEX.test(slug)) return null;
  const event = await getEventBySlug(slug);
  if (!event) return null;
  const preview = await getPreview();
  if (event.status !== "published" && !preview.enabled) return null;
  if (!event.has_detail_page && !preview.enabled) return null;
  return event;
}

export async function generateMetadata(props: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await load(slug);
  if (!event) return {};
  const media = await getMediaMap([event.media_id]);
  const img = event.media_id ? media.get(event.media_id) : null;
  return {
    title: event.title,
    description: event.summary || undefined,
    alternates: { canonical: `/eventos/${event.slug}` },
    robots: event.status !== "published" ? { index: false } : undefined,
    openGraph: {
      title: event.title,
      description: event.summary || undefined,
      url: `/eventos/${event.slug}`,
      images: img ? [{ url: mediaPublicUrl(img.storage_path), alt: img.alt_text }] : undefined,
    },
  };
}

export default async function EventDetailPage(props: PageProps<"/eventos/[slug]">) {
  const { slug } = await props.params;
  const event = await load(slug);
  if (!event) notFound();
  const [categories, settings, media] = await Promise.all([getEventCategories(), getSiteSettings(), getMediaMap([event.media_id])]);
  const category = categories.find((c) => c.id === event.category_id);
  const img = event.media_id ? (media.get(event.media_id) ?? null) : null;
  const url = `${env.siteUrl}/eventos/${event.slug}`;

  return (
    <article className="pb-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.summary,
          startDate: event.starts_at,
          endDate: event.ends_at,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: event.location || settings?.site_name, address: [settings?.address_line, settings?.city].filter(Boolean).join(", ") },
          organizer: { "@type": "Organization", name: settings?.site_name, url: env.siteUrl },
        }}
      />
      {event.status !== "published" ? (
        <p className="bg-accent/20 px-4 py-2 text-center text-sm font-semibold">Vista previa: este evento es un borrador y no es visible públicamente.</p>
      ) : null}
      <div className="container-site max-w-5xl pt-12">
        <Link href="/eventos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al calendario
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            {category ? (
              <p className="eyebrow mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} aria-hidden="true" />
                {category.name}
              </p>
            ) : null}
            <h1 className="heading-1">{event.title}</h1>
            {event.summary ? <p className="lead mt-4">{event.summary}</p> : null}
            {img ? (
              <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-theme-lg shadow-theme">
                <MediaImage media={img} priority sizes="(min-width: 1024px) 40rem, 100vw" />
              </div>
            ) : null}
            <div className="prose-site mt-8" dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.description_html) }} />
          </div>
          <aside className="lg:pt-10">
            <div className="card sticky top-28 space-y-5 p-6">
              <p className="flex gap-3">
                <CalendarPlus className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-bold first-letter:uppercase">{formatMadrid(event.starts_at, "EEEE d 'de' MMMM 'de' yyyy")}</span>
                </span>
              </p>
              <p className="flex gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{eventTimeLabel(event)} <span className="text-sm text-muted">(hora de España)</span></span>
              </p>
              {event.location ? (
                <p className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{event.location}</span>
                </p>
              ) : null}
              <a href={`/eventos/${event.slug}/calendario.ics`} className="btn btn-primary w-full" download>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Añadir a mi calendario
              </a>
              {event.external_url ? (
                <a href={event.external_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
                  Más información
                </a>
              ) : null}
            </div>
          </aside>
        </div>
        <div className="mt-12 border-t border-line pt-8">
          <ShareButtons url={url} title={event.title} />
        </div>
      </div>
    </article>
  );
}
