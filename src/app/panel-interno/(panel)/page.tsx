import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, FilePen, FileText, ImagePlus, Images, Inbox, Newspaper, PenSquare, Clock3, CalendarDays } from "lucide-react";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { formatDateTime, formatMadrid } from "@/lib/dates";

export const metadata: Metadata = { title: "Resumen" };

function Stat({ label, value, href, icon: Icon, tone = "sage" }: { label: string; value: number; href: string; icon: typeof Newspaper; tone?: "sage" | "amber" | "sky" | "rose" }) {
  const tones = {
    sage: "bg-sage-100 text-sage-700",
    amber: "bg-amber-100 text-amber-800",
    sky: "bg-sky-100 text-sky-800",
    rose: "bg-rose-100 text-rose-800",
  };
  return (
    <Link href={href} prefetch={false} className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-3xl font-extrabold tabular-nums text-stone-900">{value}</p>
      <p className="text-sm font-semibold text-stone-600 group-hover:text-stone-900">{label}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const { supabase, profile } = await requireStaffPage();
  const nowIso = new Date().toISOString();

  const [published, drafts, scheduled, upcoming, mediaCount, messages, latest, nextEvents, pendingPages, activity] = await Promise.all([
    supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "published").lte("published_at", nowIso),
    supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "published").gt("published_at", nowIso),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("ends_at", nowIso),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("news_posts").select("id, title, status, published_at, updated_at").order("updated_at", { ascending: false }).limit(6),
    supabase.from("events").select("id, title, starts_at, status, all_day").gte("ends_at", nowIso).order("starts_at").limit(6),
    supabase.from("pages").select("id, title").eq("has_unpublished_changes", true).limit(5),
    profile?.role === "admin"
      ? supabase.from("audit_log").select("id, action, entity_type, summary, created_at").order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: null }),
  ]);

  const hour = Number(formatMadrid(new Date(), "H"));
  const greeting = hour < 14 ? "Buenos días" : hour < 21 ? "Buenas tardes" : "Buenas noches";
  const name = profile?.full_name?.split(" ")[0];

  const statusBadge = (status: string, publishedAt: string | null) => {
    if (status === "draft") return <Badge>Borrador</Badge>;
    if (status === "archived") return <Badge tone="neutral">Archivada</Badge>;
    if (publishedAt && new Date(publishedAt) > new Date()) return <Badge tone="info">Programada</Badge>;
    return <Badge tone="success">Publicada</Badge>;
  };

  const ENTITY: Record<string, string> = {
    news_posts: "Noticia", events: "Evento", services: "Servicio", media: "Imagen", gallery_items: "Galería",
    pages: "Página", themes: "Tema", site_settings: "Configuración", menu_items: "Menú", testimonials: "Testimonio",
    news_categories: "Categoría", event_categories: "Categoría", gallery_categories: "Categoría", contact_messages: "Mensaje", profiles: "Usuario",
  };
  const ACTION: Record<string, string> = { create: "creó", update: "editó", delete: "eliminó", publish: "publicó" };

  return (
    <>
      <PageHeader
        title={`${greeting}${name ? `, ${name}` : ""}`}
        description="Este es el estado de la web. Desde aquí puedes crear contenido nuevo en un par de clics."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={adminHref("/noticias?nueva=1")} prefetch={false} className="flex items-center gap-3 rounded-2xl bg-sage-600 p-4 font-bold text-white shadow-sm transition hover:bg-sage-700">
          <PenSquare className="h-5 w-5" aria-hidden="true" /> Nueva publicación
        </Link>
        <Link href={adminHref("/eventos/nuevo")} prefetch={false} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 font-bold text-stone-800 shadow-sm hover:bg-stone-50">
          <CalendarPlus className="h-5 w-5 text-sage-600" aria-hidden="true" /> Nuevo evento
        </Link>
        <Link href={adminHref("/multimedia")} prefetch={false} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 font-bold text-stone-800 shadow-sm hover:bg-stone-50">
          <ImagePlus className="h-5 w-5 text-sage-600" aria-hidden="true" /> Subir fotografías
        </Link>
        <Link href={adminHref("/paginas")} prefetch={false} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 font-bold text-stone-800 shadow-sm hover:bg-stone-50">
          <FilePen className="h-5 w-5 text-sage-600" aria-hidden="true" /> Editar páginas
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Noticias publicadas" value={published.count ?? 0} href={adminHref("/noticias?estado=published")} icon={Newspaper} />
        <Stat label="Borradores" value={drafts.count ?? 0} href={adminHref("/noticias?estado=draft")} icon={FileText} tone="amber" />
        <Stat label="Programadas" value={scheduled.count ?? 0} href={adminHref("/noticias?estado=scheduled")} icon={Clock3} tone="sky" />
        <Stat label="Próximos eventos" value={upcoming.count ?? 0} href={adminHref("/eventos")} icon={CalendarDays} />
        <Stat label="Imágenes" value={mediaCount.count ?? 0} href={adminHref("/multimedia")} icon={Images} tone="sky" />
        <Stat label="Mensajes nuevos" value={messages.count ?? 0} href={adminHref("/mensajes")} icon={Inbox} tone="rose" />
      </div>

      {pendingPages.data?.length ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Cambios sin publicar en:</strong>{" "}
          {pendingPages.data.map((p, i) => (
            <span key={p.id}>
              {i > 0 ? ", " : ""}
              <Link href={adminHref(`/paginas/${p.id}`)} prefetch={false} className="font-bold underline">
                {p.title}
              </Link>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Últimas publicaciones" actions={<Link href={adminHref("/noticias")} prefetch={false} className="text-sm font-bold text-sage-700 hover:underline">Ver todas</Link>}>
          {latest.data?.length ? (
            <ul className="divide-y divide-stone-100">
              {latest.data.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={adminHref(`/noticias/${n.id}`)} prefetch={false} className="min-w-0 truncate font-semibold text-stone-800 hover:text-sage-700">
                    {n.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-stone-500">
                    {statusBadge(n.status, n.published_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">Aún no hay noticias.</p>
          )}
        </Card>
        <Card title="Próximos eventos" actions={<Link href={adminHref("/eventos")} prefetch={false} className="text-sm font-bold text-sage-700 hover:underline">Calendario</Link>}>
          {nextEvents.data?.length ? (
            <ul className="divide-y divide-stone-100">
              {nextEvents.data.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={adminHref(`/eventos/${e.id}`)} prefetch={false} className="min-w-0 truncate font-semibold text-stone-800 hover:text-sage-700">
                    {e.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-stone-500">
                    {e.status === "draft" ? <Badge>Borrador</Badge> : null}
                    {e.all_day ? formatMadrid(e.starts_at, "d MMM") : formatDateTime(e.starts_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">No hay eventos próximos.</p>
          )}
        </Card>
      </div>

      {activity.data ? (
        <Card title="Actividad reciente" className="mt-6">
          {activity.data.length ? (
            <ul className="space-y-2 text-sm">
              {activity.data.map((a) => (
                <li key={a.id} className="flex flex-wrap gap-x-2 text-stone-700">
                  <span className="text-stone-500">{formatDateTime(a.created_at)}</span>
                  <span>
                    Se {ACTION[a.action] ?? (a.action.startsWith("status:") ? "cambió el estado de" : a.action.startsWith("role:") ? "cambió el rol de" : a.action)}{" "}
                    {(ENTITY[a.entity_type] ?? a.entity_type).toLowerCase()}
                    {a.summary ? <strong> «{a.summary}»</strong> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">Sin actividad registrada todavía.</p>
          )}
        </Card>
      ) : null}
    </>
  );
}
