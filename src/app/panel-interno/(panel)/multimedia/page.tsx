import type { Metadata } from "next";
import Link from "next/link";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { GalleryManager, type GalleryRow } from "@/components/admin/media/gallery-manager";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";

export const metadata: Metadata = { title: "Galería multimedia" };

export default async function MediaPage({ searchParams }: PageProps<"/panel-interno/multimedia">) {
  const { supabase } = await requireStaffPage();
  const tab = (await searchParams).tab === "galeria" ? "galeria" : "biblioteca";

  let gallery: GalleryRow[] = [];
  let categories: { id: string; name: string }[] = [];
  if (tab === "galeria") {
    const [{ data: items }, { data: cats }] = await Promise.all([
      supabase.from("gallery_items").select(`id, caption, category_id, is_visible, media(${MEDIA_LITE_COLUMNS})`).order("sort_order"),
      supabase.from("gallery_categories").select("id, name").order("sort_order").order("name"),
    ]);
    gallery = (items ?? [])
      .filter((i) => i.media)
      .map((i) => ({ id: i.id, caption: i.caption, category_id: i.category_id, is_visible: i.is_visible, media: i.media as MediaLite }));
    categories = cats ?? [];
  }

  const tabClass = (active: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-bold ${active ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`;

  return (
    <>
      <PageHeader
        title="Galería multimedia"
        description="Todas las imágenes de la web. Solo fotografías con autorización: evita que se pueda identificar a residentes sin su consentimiento por escrito."
      />
      <nav className="mb-6 inline-flex rounded-xl bg-stone-200/70 p-1" aria-label="Secciones">
        <Link href={adminHref("/multimedia")} prefetch={false} className={tabClass(tab === "biblioteca")} aria-current={tab === "biblioteca" ? "page" : undefined}>
          Biblioteca
        </Link>
        <Link href={adminHref("/multimedia?tab=galeria")} prefetch={false} className={tabClass(tab === "galeria")} aria-current={tab === "galeria" ? "page" : undefined}>
          Galería de instalaciones
        </Link>
      </nav>
      {tab === "biblioteca" ? <MediaLibrary /> : <GalleryManager key={gallery.map((g) => g.id).join()} initial={gallery} categories={categories} />}
    </>
  );
}
