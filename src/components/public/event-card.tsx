import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { formatMadrid, formatTime, dayKey } from "@/lib/dates";

export type EventCardData = {
  title: string;
  slug: string;
  summary: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  has_detail_page: boolean;
  external_url: string | null;
};

export function eventTimeLabel(e: Pick<EventCardData, "starts_at" | "ends_at" | "all_day">): string {
  const sameDay = dayKey(e.starts_at) === dayKey(e.ends_at);
  if (e.all_day) {
    return sameDay
      ? "Todo el día"
      : `Del ${formatMadrid(e.starts_at, "d MMM")} al ${formatMadrid(e.ends_at, "d MMM")}`;
  }
  return sameDay
    ? `${formatTime(e.starts_at)} – ${formatTime(e.ends_at)}`
    : `${formatMadrid(e.starts_at, "d MMM, HH:mm")} – ${formatMadrid(e.ends_at, "d MMM, HH:mm")}`;
}

export function eventHref(e: Pick<EventCardData, "slug" | "has_detail_page" | "external_url">): string | null {
  if (e.has_detail_page) return `/eventos/${e.slug}`;
  return e.external_url ?? null;
}

/** Tarjeta de evento con fecha destacada (estilo agenda). */
export function EventCard({ event, compact = false }: { event: EventCardData; compact?: boolean }) {
  const href = eventHref(event);
  return (
    <article className="card card-hover group relative flex gap-5 p-5">
      <div
        className="flex h-20 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-theme-sm bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <span className="text-xs font-bold uppercase tracking-wider">{formatMadrid(event.starts_at, "MMM")}</span>
        <span className="font-heading text-3xl leading-none">{formatMadrid(event.starts_at, "d")}</span>
        <span className="text-[0.7rem] capitalize">{formatMadrid(event.starts_at, "EEE")}</span>
      </div>
      <div className="min-w-0 flex-1">
        {event.categoryName ? (
          <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: event.categoryColor ?? "currentColor" }} />
            {event.categoryName}
          </p>
        ) : null}
        <h3 className="text-lg leading-snug">
          {href ? (
            <Link
              href={href}
              className="after:absolute after:inset-0 hover:text-primary"
              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {event.title}
            </Link>
          ) : (
            event.title
          )}
        </h3>
        <p className="sr-only">Fecha: {formatMadrid(event.starts_at, "EEEE d 'de' MMMM 'de' yyyy")}</p>
        <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" /> {eventTimeLabel(event)}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" /> {event.location}
            </span>
          ) : null}
        </p>
        {!compact && event.summary ? <p className="mt-2 line-clamp-2 text-muted">{event.summary}</p> : null}
      </div>
    </article>
  );
}
