import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { NewsEditor } from "@/components/admin/news/news-editor";

export const metadata: Metadata = { title: "Nueva noticia" };

export default async function NewNewsPage() {
  const { supabase } = await requireStaffPage();
  const { data: categories } = await supabase.from("news_categories").select("id, name").order("sort_order").order("name");
  return (
    <NewsEditor
      categories={categories ?? []}
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        content_html: "",
        featured: null,
        gallery: [],
        category_id: "",
        author_name: "",
        status: "draft",
        published_at: null,
        is_featured: false,
        seo_title: "",
        seo_description: "",
        scheduled_date: "",
        scheduled_time: "10:00",
      }}
    />
  );
}
