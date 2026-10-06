import Link from "next/link";
import { MediaImage } from "./media-image";
import type { MediaLite } from "@/features/media/url";
import { formatLongDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type NewsCardData = {
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  is_featured: boolean;
  categoryName: string | null;
};

/** Tarjeta de noticia. variant "feed" = estilo publicación (imagen + texto en fila). */
export function NewsCard({
  post,
  media,
  variant = "cards",
  headingLevel = 3,
}: {
  post: NewsCardData;
  media: MediaLite | null;
  variant?: "feed" | "cards";
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const date = post.published_at ? formatLongDate(post.published_at) : null;
  return (
    <article
      className={cn(
        "card card-hover group relative flex h-full",
        variant === "feed" ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-surface-alt",
          variant === "feed" ? "aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-52" : "aspect-[16/10]",
        )}
      >
        <MediaImage
          media={media}
          fallbackAlt=""
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-700 group-hover:scale-[1.04]"
          placeholderLabel="Sin imagen"
        />
        {post.is_featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-theme-sm">
            Destacada
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {post.categoryName ? <span className="font-bold text-primary">{post.categoryName}</span> : null}
          {date ? <time dateTime={post.published_at ?? undefined}>{date}</time> : null}
        </p>
        <H className="text-xl leading-snug">
          <Link href={`/noticias/${post.slug}`} className="after:absolute after:inset-0 hover:text-primary">
            {post.title}
          </Link>
        </H>
        {post.excerpt ? <p className="line-clamp-3 text-muted">{post.excerpt}</p> : null}
        <span className="mt-auto pt-2 text-sm font-bold text-primary" aria-hidden="true">
          Leer más →
        </span>
      </div>
    </article>
  );
}
