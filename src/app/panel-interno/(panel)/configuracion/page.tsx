import type { Metadata } from "next";
import Link from "next/link";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { Card, PageHeader } from "@/components/admin/ui";
import { CategoriesManager, OwnProfileForm, SeoForm, TestimonialsManager, UsersManager } from "@/components/admin/settings/config-forms";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { isServiceRoleConfigured } from "@/lib/env";
import { formatDateTime } from "@/lib/dates";

export const metadata: Metadata = { title: "Configuración" };

const TABS = [
  { key: "general", label: "General", admin: false },
  { key: "categorias", label: "Categorías", admin: false },
  { key: "testimonios", label: "Testimonios", admin: false },
  { key: "usuarios", label: "Usuarios", admin: true },
  { key: "actividad", label: "Registro de actividad", admin: true },
] as const;

const ACTION: Record<string, string> = { create: "Creación", update: "Edición", delete: "Borrado", publish: "Publicación" };
const ENTITY: Record<string, string> = {
  news_posts: "Noticia", events: "Evento", services: "Servicio", media: "Imagen", gallery_items: "Galería", pages: "Página", themes: "Tema",
  site_settings: "Configuración", menu_items: "Menú", testimonials: "Testimonio", news_categories: "Categoría de noticias",
  event_categories: "Categoría de eventos", gallery_categories: "Categoría de galería", contact_messages: "Mensaje", profiles: "Usuario",
};

export default async function SettingsPage({ searchParams }: PageProps<"/panel-interno/configuracion">) {
  const { supabase, role, user, profile } = await requireStaffPage();
  const isAdmin = role === "admin";
  const requested = (await searchParams).tab;
  const tabs = TABS.filter((t) => isAdmin || !t.admin);
  const tab = tabs.find((t) => t.key === requested)?.key ?? "general";

  let content: React.ReactNode = null;

  if (tab === "general") {
    const { data: s } = await supabase.from("site_settings").select("seo_title, seo_description, og_media_id").eq("id", 1).maybeSingle();
    const { data: og } = s?.og_media_id ? await supabase.from("media").select(MEDIA_LITE_COLUMNS).eq("id", s.og_media_id).maybeSingle() : { data: null };
    content = (
      <div className="space-y-6">
        <OwnProfileForm name={profile?.full_name ?? ""} email={user.email ?? ""} />
        {isAdmin ? <SeoForm initial={{ seo_title: s?.seo_title ?? "", seo_description: s?.seo_description ?? "", og: (og as MediaLite | null) ?? null }} /> : null}
      </div>
    );
  }

  if (tab === "categorias") {
    const [n, e, g, nc, ec, gc] = await Promise.all([
      supabase.from("news_categories").select("id, name, slug").order("sort_order"),
      supabase.from("event_categories").select("id, name, slug, color").order("sort_order"),
      supabase.from("gallery_categories").select("id, name, slug").order("sort_order"),
      supabase.from("news_posts").select("category_id"),
      supabase.from("events").select("category_id"),
      supabase.from("gallery_items").select("category_id"),
    ]);
    const count = (rows: { category_id: string | null }[] | null, id: string) => (rows ?? []).filter((r) => r.category_id === id).length;
    content = (
      <div className="grid gap-6 lg:grid-cols-3">
        <CategoriesManager kind="news" title="Noticias" items={(n.data ?? []).map((c) => ({ ...c, count: count(nc.data, c.id) }))} />
        <CategoriesManager kind="events" title="Eventos" items={(e.data ?? []).map((c) => ({ ...c, count: count(ec.data, c.id) }))} />
        <CategoriesManager kind="gallery" title="Galería" items={(g.data ?? []).map((c) => ({ ...c, count: count(gc.data, c.id) }))} />
      </div>
    );
  }

  if (tab === "testimonios") {
    const [{ data }, { data: s }] = await Promise.all([
      supabase.from("testimonials").select("id, quote, author_label, consent_confirmed, consent_reference, status").order("sort_order").order("created_at"),
      supabase.from("site_settings").select("testimonials_enabled").eq("id", 1).maybeSingle(),
    ]);
    content = <TestimonialsManager enabled={s?.testimonials_enabled ?? false} items={(data ?? []).map((t) => ({ ...t, consent_reference: t.consent_reference ?? "" }))} />;
  }

  if (tab === "usuarios" && isAdmin) {
    const { data } = await supabase.from("profiles").select("id, email, full_name, role").order("email");
    content = <UsersManager canInvite={isServiceRoleConfigured()} users={(data ?? []).map((u) => ({ ...u, isSelf: u.id === user.id }))} />;
  }

  if (tab === "actividad" && isAdmin) {
    const { data } = await supabase.from("audit_log").select("id, action, entity_type, summary, created_at, actor:profiles(email, full_name)").order("created_at", { ascending: false }).limit(100);
    content = (
      <Card title="Últimas 100 acciones">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="py-2 pr-3">Fecha</th>
                <th scope="col" className="py-2 pr-3">Persona</th>
                <th scope="col" className="py-2 pr-3">Acción</th>
                <th scope="col" className="py-2">Elemento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(data ?? []).map((a) => {
                const actor = a.actor as { email: string; full_name: string | null } | null;
                return (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap py-2 pr-3 text-stone-500">{formatDateTime(a.created_at)}</td>
                    <td className="py-2 pr-3">{actor?.full_name || actor?.email || "Sistema"}</td>
                    <td className="py-2 pr-3">{ACTION[a.action] ?? (a.action.startsWith("status:") ? "Cambio de estado" : a.action.startsWith("role:") ? "Cambio de rol" : a.action)}</td>
                    <td className="py-2">
                      {ENTITY[a.entity_type] ?? a.entity_type}
                      {a.summary ? <span className="text-stone-500"> · {a.summary}</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <>
      <PageHeader title="Configuración" />
      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl bg-stone-200/70 p-1 sm:inline-flex" aria-label="Secciones de configuración">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={adminHref(t.key === "general" ? "/configuracion" : `/configuracion?tab=${t.key}`)}
            prefetch={false}
            aria-current={tab === t.key ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === t.key ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {content}
    </>
  );
}
