import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsBySlug, getNewsCategories } from "@/features/news/queries";
import { getMediaMap, getSiteSettings } from "@/features/site/queries";
import { mediaPublicUrl } from "@/features/media/url";
import { MediaImage } from "@/components/public/media-image";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { ShareButtons } from "@/components/public/share-buttons";
import { JsonLd } from "@/components/public/json-ld";
import { formatLongDate } from "@/lib/dates";
import { sanitizeRichText } from "@/lib/sanitize";
import { env } from "@/lib/env";
import { SLUG_REGEX, stripHtml, truncate } from "@/lib/utils";
import { getPreview } from "@/lib/preview";

async function load(slug: string) {
  if (!SLUG_REGEX.test(slug)) return null;
  const result = await getNewsBySlug(slug);
  if (!result) return null;
  const preview = await getPreview();
  const { post } = result;
  const isPublic = post.status === "published" && post.published_at && new Date(post.published_at) <= new Date();
  // Fuera de la vista previa solo se muestran noticias publicadas (también lo garantiza RLS).
  if (!isPublic && !preview.enabled) return null;
  return { ...result, isPreview: !isPublic };
}

export async function generateMetadata(props: PageProps<"/noticias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await load(slug);
  if (!data) return {};
  const { post } = data;
  const media = await getMediaMap([post.featured_media_id]);
  const img = post.featured_media_id ? media.get(post.featured_media_id) : null;
  const description = post.seo_description || post.excerpt || truncate(stripHtml(post.content_html), 160);
  return {
    title: post.seo_title || post.title,
    description,
    alternates: { canonical: `/noticias/${post.slug}` },
    robots: data.isPreview ? { index: false } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/noticias/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: img ? [{ url: mediaPublicUrl(img.storage_path), alt: img.alt_text, width: img.width ?? undefined, height: img.height ?? undefined }] : undefined,
    },
    twitter: { card: img ? "summary_large_image" : "summary" },
  };
}

export default async function NewsDetailPage(props: PageProps<"/noticias/[slug]">) {
  const { slug } = await props.params;
  const data = await load(slug);
  if (!data) notFound();
  const { post, galleryIds } = data;
  const [categories, settings, media] = await Promise.all([
    getNewsCategories(),
    getSiteSettings(),
    getMediaMap([post.featured_media_id, ...galleryIds]),
  ]);
  const category = categories.find((c) => c.id === post.category_id);
  const featured = post.featured_media_id ? (media.get(post.featured_media_id) ?? null) : null;
  const gallery = galleryIds
    .map((id) => media.get(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .map((m) => ({ id: m.id, media: m, caption: m.title }));
  const url = `${env.siteUrl}/noticias/${post.slug}`;

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          image: featured ? [`${featured.storage_path.startsWith("demo/") ? env.siteUrl : ""}${mediaPublicUrl(featured.storage_path)}`] : undefined,
          author: post.author_name ? { "@type": "Person", name: post.author_name } : { "@type": "Organization", name: settings?.site_name },
          publisher: { "@type": "Organization", name: settings?.site_name },
          mainEntityOfPage: url,
        }}
      />
      {data.isPreview ? (
        <p className="bg-accent/20 px-4 py-2 text-center text-sm font-semibold">
          Vista previa: esta noticia no es visible públicamente ({post.status === "published" ? "programada" : "borrador"}).
        </p>
      ) : null}
      <header className="container-site max-w-4xl pb-8 pt-12 sm:pt-16">
        <Link href="/noticias" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todas las noticias
        </Link>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {category ? (
            <Link href={`/noticias?categoria=${category.slug}`} className="font-bold text-primary hover:underline">
              {category.name}
            </Link>
          ) : null}
          {post.published_at ? <time dateTime={post.published_at}>{formatLongDate(post.published_at)}</time> : null}
          {post.author_name ? <span>· {post.author_name}</span> : null}
        </p>
        <h1 className="heading-1 mt-3">{post.title}</h1>
        {post.excerpt ? <p className="lead mt-5">{post.excerpt}</p> : null}
      </header>
      {featured ? (
        <div className="container-site max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-theme-lg shadow-theme">
            <MediaImage media={featured} priority sizes="(min-width: 1024px) 64rem, 100vw" />
          </div>
        </div>
      ) : null}
      <div className="container-site max-w-3xl py-12">
        <div className="prose-site mx-auto" dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content_html) }} />
        {gallery.length ? (
          <section className="mt-12" aria-labelledby="fotos-noticia">
            <h2 id="fotos-noticia" className="heading-3 mb-5">
              Fotografías
            </h2>
            <LightboxGallery items={gallery} columns={3} />
          </section>
        ) : null}
        <div className="mt-12 border-t border-line pt-8">
          <ShareButtons url={url} title={post.title} />
        </div>
      </div>
    </article>
  );
}
