import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { AdminCalendar } from "@/components/admin/events/admin-calendar";
import { EventList, type EventListRow } from "@/components/admin/events/event-list";
import { formatDateTime, formatLongDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Eventos" };

export default async function EventsAdminPage() {
  const { supabase } = await requireStaffPage();
  const [{ data: categories }, { data: upcoming }] = await Promise.all([
    supabase.from("event_categories").select("id, name, color").order("sort_order").order("name"),
    supabase
      .from("events")
      .select("id, title, starts_at, ends_at, all_day, status, is_demo, category:event_categories(name, color)")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at")
      .limit(15),
  ]);

  const rows: EventListRow[] = (upcoming ?? []).map((e) => {
    const cat = e.category as { name: string; color: string } | null;
    return {
      id: e.id,
      title: e.title,
      when: e.all_day ? formatLongDate(e.starts_at) : formatDateTime(e.starts_at),
      status: e.status,
      is_demo: e.is_demo,
      category: cat?.name ?? null,
      color: cat?.color ?? null,
    };
  });

  return (
    <>
      <PageHeader
        title="Eventos y calendario"
        description="Organiza las actividades del centro. Los borradores solo se ven aquí."
        actions={
          <LinkButton href={adminHref("/eventos/nuevo")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo evento
          </LinkButton>
        }
      />
      <AdminCalendar categories={categories ?? []} />
      <h2 className="mb-3 mt-10 text-lg text-stone-900">Próximos eventos</h2>
      <EventList rows={rows} />
    </>
  );
}
