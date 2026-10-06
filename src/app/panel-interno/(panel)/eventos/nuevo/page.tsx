import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { EventForm } from "@/components/admin/events/event-form";
import { dayKey } from "@/lib/dates";

export const metadata: Metadata = { title: "Nuevo evento" };

export default async function NewEventPage({ searchParams }: PageProps<"/panel-interno/eventos/nuevo">) {
  const { supabase } = await requireStaffPage();
  const sp = await searchParams;
  const fecha = typeof sp.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.fecha) ? sp.fecha : dayKey(new Date());
  const { data: categories } = await supabase.from("event_categories").select("id, name, color").order("sort_order").order("name");
  return (
    <EventForm
      categories={categories ?? []}
      initial={{
        title: "",
        slug: "",
        summary: "",
        description_html: "",
        all_day: false,
        start_date: fecha,
        start_time: "17:00",
        end_date: fecha,
        end_time: "18:00",
        location: "",
        media: null,
        category_id: "",
        status: "draft",
        is_featured: false,
        has_detail_page: true,
        external_url: "",
      }}
    />
  );
}
