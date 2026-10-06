import { getEventBySlug } from "@/features/events/queries";
import { getSiteSettings } from "@/features/site/queries";
import { env, isSupabaseConfigured } from "@/lib/env";
import { SLUG_REGEX } from "@/lib/utils";

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Descarga .ics de un evento publicado. */
export async function GET(_req: Request, ctx: RouteContext<"/eventos/[slug]/calendario.ics">) {
  const { slug } = await ctx.params;
  if (!isSupabaseConfigured() || !SLUG_REGEX.test(slug)) return new Response("No encontrado", { status: 404 });
  const event = await getEventBySlug(slug);
  if (!event || event.status !== "published") return new Response("No encontrado", { status: 404 });
  const settings = await getSiteSettings();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Residencia//CMS//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@${new URL(env.siteUrl).hostname}`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(event.starts_at)}`,
    `DTEND:${icsDate(event.ends_at)}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(event.summary)}`,
    `LOCATION:${icsText(event.location || settings?.site_name || "")}`,
    `URL:${env.siteUrl}/eventos/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
