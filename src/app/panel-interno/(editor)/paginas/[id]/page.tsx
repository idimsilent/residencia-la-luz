import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { PageEditor } from "@/components/admin/pages/page-editor";
import { blocksFromRows } from "@/features/blocks/schema";
import { loadBlockData } from "@/features/blocks/load-data";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { parseTheme } from "@/features/theme/schema";
import { SALVIA_THEME } from "@/features/theme/presets";
import { isUuid } from "@/lib/utils";

export const metadata: Metadata = { title: "Editor de página" };

export default async function PageEditorRoute({ params }: PageProps<"/panel-interno/paginas/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireStaffPage();
  const [{ data: page }, { data: rows }, { data: revisions }, { data: theme }] = await Promise.all([
    supabase.from("pages").select(`*, og:media!pages_og_media_id_fkey(${MEDIA_LITE_COLUMNS})`).eq("id", id).maybeSingle(),
    supabase.from("page_blocks").select("id, type, props, is_hidden, visibility, schema_version").eq("page_id", id).is("revision_id", null).order("position"),
    supabase.from("page_revisions").select("id, version, note, created_at").eq("page_id", id).order("version", { ascending: false }).limit(30),
    supabase.from("themes").select("tokens").eq("is_active", true).maybeSingle(),
  ]);
  if (!page) notFound();

  const blocks = blocksFromRows(rows ?? []);
  // Datos de todos los módulos para que cualquier bloque nuevo se vea al instante.
  const data = await loadBlockData(blocks, { everything: true });

  return (
    <PageEditor
      key={`${page.id}:${page.updated_at}:${page.draft_updated_at}`}
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        kind: page.kind,
        is_system: page.is_system,
        status: page.status,
        has_unpublished_changes: page.has_unpublished_changes,
        seo_title: page.seo_title ?? "",
        seo_description: page.seo_description ?? "",
        og_media: (page.og as MediaLite | null) ?? null,
        publicPath: page.slug === "inicio" ? "/" : `/${page.slug}`,
      }}
      initialBlocks={blocks}
      data={data}
      theme={parseTheme(theme?.tokens) ?? SALVIA_THEME}
      revisions={(revisions ?? []).map((r) => ({ ...r, isPublished: r.id === page.published_revision_id }))}
    />
  );
}
