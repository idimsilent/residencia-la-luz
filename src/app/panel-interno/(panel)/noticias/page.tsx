import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { QuickComposer } from "@/components/admin/news/quick-composer";
import { NewsTable, type NewsRow } from "@/components/admin/news/news-table";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { madridLocalToUtcIso } from "@/lib/dates";

export const metadata: Metadata = { title: "Noticias" };

const PAGE_SIZE = 20;
const ESTADOS = { draft: "Borradores", published: "Publicadas", scheduled: "Programadas", archived: "Archivadas" } as const;
const ORDENES = { recientes: "Más recientes", antiguas: "Más antiguas", titulo: "Título (A-Z)", editadas: "Editadas recientemente" } as const;

export default async function NewsAdminPage({ searchParams }: PageProps<"/panel-interno/noticias">) {
  const { supabase } = await requireStaffPage();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = str("q").slice(0, 100);
  const estado = str("estado") as keyof typeof ESTADOS | "";
  const categoria = str("categoria");
  const desde = /^\d{4}-\d{2}-\d{2}$/.test(str("desde")) ? str("desde") : "";
  const hasta = /^\d{4}-\d{2}-\d{2}$/.test(str("hasta")) ? str("hasta") : "";
  const orden = (str("orden") in ORDENES ? str("orden") : "recientes") as keyof typeof ORDENES;
  const pagina = Math.max(1, Number.parseInt(str("pagina") || "1", 10) || 1);
  const nowIso = new Date().toISOString();

  let query = supabase
    .from("news_posts")
    .select(`id, title, slug, status, published_at, updated_at, is_featured, is_demo, category:news_categories(name), featured:media!news_posts_featured_media_id_fkey(${MEDIA_LITE_COLUMNS})`, { count: "exact" });
  if (q) query = query.ilike("title", `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`);
  if (estado === "draft") query = query.eq("status", "draft");
  if (estado === "archived") query = query.eq("status", "archived");
  if (estado === "published") query = query.eq("status", "published").lte("published_at", nowIso);
  if (estado === "scheduled") query = query.eq("status", "published").gt("published_at", nowIso);
  if (categoria) query = query.eq("category_id", categoria);
  if (desde) query = query.gte("published_at", madridLocalToUtcIso(desde, "00:00"));
  if (hasta) query = query.lte("published_at", madridLocalToUtcIso(hasta, "23:59", 59));
  if (orden === "titulo") query = query.order("title");
  else if (orden === "editadas") query = query.order("updated_at", { ascending: false });
  else query = query.order("published_at", { ascending: orden === "antiguas", nullsFirst: orden !== "antiguas" }).order("created_at", { ascending: false });
  query = query.range((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE - 1);

  const [{ data, count, error }, { data: categories }] = await Promise.all([
    query,
    supabase.from("news_categories").select("id, name").order("sort_order").order("name"),
  ]);
  if (error) console.error("[admin/noticias]", error);

  const rows: NewsRow[] = (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    status: n.status,
    published_at: n.published_at,
    updated_at: n.updated_at,
    is_featured: n.is_featured,
    is_demo: n.is_demo,
    category: (n.category as { name: string } | null)?.name ?? null,
    featured: (n.featured as MediaLite | null) ?? null,
  }));
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const base = { q, estado, categoria, desde, hasta, orden: orden === "recientes" ? "" : orden, pagina: String(pagina) };
    for (const [k, v] of Object.entries({ ...base, ...patch })) if (v && !(k === "pagina" && String(v) === "1")) p.set(k, String(v));
    const s = p.toString();
    return adminHref(`/noticias${s ? `?${s}` : ""}`);
  };

  return (
    <>
      <PageHeader
        title="Noticias"
        description="Publica novedades del centro en segundos o prepara artículos completos con fotografías y fecha programada."
        actions={
          <LinkButton href={adminHref("/noticias/nueva")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Artículo completo
          </LinkButton>
        }
      />

      <QuickComposer categories={categories ?? []} autoFocus={str("nueva") === "1"} />

      <nav aria-label="Filtrar por estado" className="mb-4 mt-8 flex flex-wrap gap-2">
        {[["", "Todas"] as const, ...Object.entries(ESTADOS)].map(([key, label]) => (
          <Link
            key={key}
            href={qs({ estado: key, pagina: 1 })}
            prefetch={false}
            aria-current={estado === key ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${estado === key ? "bg-sage-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mb-4 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]" role="search">
        {estado ? <input type="hidden" name="estado" value={estado} /> : null}
        <label className="relative">
          <span className="sr-only">Buscar por título</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input name="q" defaultValue={q} placeholder="Buscar por título…" className="admin-input pl-9" />
        </label>
        <label>
          <span className="sr-only">Categoría</span>
          <select name="categoria" defaultValue={categoria} className="admin-input">
            <option value="">Todas las categorías</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Desde</span>
          <input type="date" name="desde" defaultValue={desde} className="admin-input" aria-label="Publicadas desde" />
        </label>
        <label>
          <span className="sr-only">Hasta</span>
          <input type="date" name="hasta" defaultValue={hasta} className="admin-input" aria-label="Publicadas hasta" />
        </label>
        <label>
          <span className="sr-only">Ordenar</span>
          <select name="orden" defaultValue={orden} className="admin-input">
            {Object.entries(ORDENES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-lg bg-stone-800 px-4 text-sm font-bold text-white hover:bg-stone-900">
          Filtrar
        </button>
      </form>

      <NewsTable rows={rows} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p>
          {total} {total === 1 ? "noticia" : "noticias"}
          {pages > 1 ? ` · página ${pagina} de ${pages}` : ""}
        </p>
        {pages > 1 ? (
          <div className="flex gap-2">
            {pagina > 1 ? (
              <Link href={qs({ pagina: pagina - 1 })} prefetch={false} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-bold hover:bg-stone-50">
                Anterior
              </Link>
            ) : null}
            {pagina < pages ? (
              <Link href={qs({ pagina: pagina + 1 })} prefetch={false} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-bold hover:bg-stone-50">
                Siguiente
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
