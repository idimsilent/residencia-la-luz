import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";
import { Reveal } from "@/components/public/reveal";
import { getMediaMap, getPageBySlug, getActiveTheme } from "@/features/site/queries";
import { getNewsCategories, listPublishedNews, NEWS_PAGE_SIZE } from "@/features/news/queries";
import { pageMetadata } from "@/features/pages/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("noticias", "Noticias y actualidad", "/noticias");
}

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function NewsPage(props: PageProps<"/noticias">) {
  const sp = await props.searchParams;
  const q = (one(sp.q) ?? "").trim().slice(0, 80);
  const categorySlug = one(sp.categoria) ?? null;
  const page = Math.max(1, Math.min(500, Number(one(sp.pagina)) || 1));

  const [resolved, categories, theme] = await Promise.all([getPageBySlug("noticias"), getNewsCategories(), getActiveTheme()]);
  const category = categories.find((c) => c.slug === categorySlug) ?? null;
  const { items, total } = await listPublishedNews({ page, categoryId: category?.id, search: q || null });
  const media = await getMediaMap(items.map((i) => i.featured_media_id));
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const totalPages = Math.ceil(total / NEWS_PAGE_SIZE);
  const variant = theme.tokens.components.newsCardStyle;

  const hrefFor = (p: number, cat: string | null = category?.slug ?? null) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("categoria", cat);
    if (p > 1) params.set("pagina", String(p));
    const s = params.toString();
    return `/noticias${s ? `?${s}` : ""}`;
  };

  const blocks = resolved?.blocks ?? [];
  return (
    <>
      {blocks.length ? (
        <BlocksRenderer blocks={blocks} />
      ) : (
        <PageHero eyebrow="Actualidad" title="Noticias" intro="Lo que pasa en nuestro día a día." />
      )}
      <section className="container-site pb-20 pt-10">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Categorías de noticias">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={hrefFor(1, null)}
                  aria-current={!category ? "page" : undefined}
                  className={cn("inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition", !category ? "border-primary bg-primary text-primary-contrast" : "border-line hover:border-primary")}
                >
                  Todas
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={hrefFor(1, c.slug)}
                    aria-current={category?.id === c.id ? "page" : undefined}
                    className={cn("inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition", category?.id === c.id ? "border-primary bg-primary text-primary-contrast" : "border-line hover:border-primary")}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form role="search" action="/noticias" className="flex w-full gap-2 lg:w-80">
            {category ? <input type="hidden" name="categoria" value={category.slug} /> : null}
            <label htmlFor="buscar-noticias" className="sr-only">
              Buscar noticias
            </label>
            <input id="buscar-noticias" name="q" type="search" defaultValue={q} placeholder="Buscar noticias…" className="field-input" maxLength={80} />
            <button type="submit" className="btn btn-primary min-h-11 px-4" aria-label="Buscar">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        <p className="sr-only" aria-live="polite">
          {total} noticias encontradas
        </p>
        {q ? (
          <p className="mb-6 text-muted">
            {total} {total === 1 ? "resultado" : "resultados"} para «{q}».{" "}
            <Link href={hrefFor(1)} className="font-semibold text-primary underline">
              Quitar búsqueda
            </Link>
          </p>
        ) : null}

        {items.length === 0 ? (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <p className="font-heading text-2xl">No hay noticias que mostrar</p>
            <p className="mt-2 text-muted">
              {q || category ? "Prueba con otra búsqueda o categoría." : "Muy pronto compartiremos novedades."}
            </p>
          </div>
        ) : (
          <ul className={cn("grid gap-6", variant === "feed" ? "mx-auto max-w-4xl" : "md:grid-cols-2 lg:grid-cols-3")}>
            {items.map((n, i) => (
              <Reveal as="li" key={n.id} delay={(i % 3) * 70}>
                <NewsCard
                  headingLevel={2}
                  variant={variant}
                  post={{ ...n, categoryName: n.category_id ? (catName.get(n.category_id) ?? null) : null }}
                  media={n.featured_media_id ? (media.get(n.featured_media_id) ?? null) : null}
                />
              </Reveal>
            ))}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} hrefFor={(p) => hrefFor(p)} />
      </section>
    </>
  );
}
