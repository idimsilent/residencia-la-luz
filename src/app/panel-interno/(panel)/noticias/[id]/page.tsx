import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { NewsEditor } from "@/components/admin/news/news-editor";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { utcToMadridParts } from "@/lib/dates";
import { isUuid } from "@/lib/utils";

export const metadata: Metadata = { title: "Editar noticia" };

export default async function EditNewsPage({ params }: PageProps<"/panel-interno/noticias/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireStaffPage();
  const [{ data: post }, { data: categories }, { data: gallery }] = await Promise.all([
    supabase.from("news_posts").select(`*, featured:media!news_posts_featured_media_id_fkey(${MEDIA_LITE_COLUMNS})`).eq("id", id).maybeSingle(),
    supabase.from("news_categories").select("id, name").order("sort_order").order("name"),
    supabase.from("news_post_media").select(`sort_order, media(${MEDIA_LITE_COLUMNS})`).eq("post_id", id).order("sort_order"),
  ]);
  if (!post) notFound();
  const sched = post.published_at ? utcToMadridParts(post.published_at) : { date: "", time: "10:00" };

  return (
    <NewsEditor
      key={post.updated_at}
      categories={categories ?? []}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content_html: post.content_html,
        featured: (post.featured as MediaLite | null) ?? null,
        gallery: (gallery ?? []).map((g) => g.media as MediaLite | null).filter((m): m is MediaLite => Boolean(m)),
        category_id: post.category_id ?? "",
        author_name: post.author_name ?? "",
        status: post.status,
        published_at: post.published_at,
        is_featured: post.is_featured,
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
        scheduled_date: sched.date,
        scheduled_time: sched.time,
      }}
    />
  );
}
