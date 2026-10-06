import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { EventForm } from "@/components/admin/events/event-form";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { utcToMadridParts } from "@/lib/dates";
import { isUuid } from "@/lib/utils";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEventPage({ params }: PageProps<"/panel-interno/eventos/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireStaffPage();
  const [{ data: ev }, { data: categories }] = await Promise.all([
    supabase.from("events").select(`*, media(${MEDIA_LITE_COLUMNS})`).eq("id", id).maybeSingle(),
    supabase.from("event_categories").select("id, name, color").order("sort_order").order("name"),
  ]);
  if (!ev) notFound();
  const s = utcToMadridParts(ev.starts_at);
  const e = utcToMadridParts(ev.ends_at);
  return (
    <EventForm
      key={ev.updated_at}
      categories={categories ?? []}
      initial={{
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        summary: ev.summary,
        description_html: ev.description_html,
        all_day: ev.all_day,
        start_date: s.date,
        start_time: ev.all_day ? "17:00" : s.time,
        end_date: e.date,
        end_time: ev.all_day ? "18:00" : e.time,
        location: ev.location ?? "",
        media: (ev.media as MediaLite | null) ?? null,
        category_id: ev.category_id ?? "",
        status: ev.status,
        is_featured: ev.is_featured,
        has_detail_page: ev.has_detail_page,
        external_url: ev.external_url ?? "",
      }}
    />
  );
}
