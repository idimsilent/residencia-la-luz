import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { ThemeEditor } from "@/components/admin/themes/theme-editor";
import { parseTheme } from "@/features/theme/schema";
import { blocksFromRows } from "@/features/blocks/schema";
import { loadBlockData } from "@/features/blocks/load-data";
import { getMediaMap, getMenu, getSiteSettings, parseOpeningHours, parseSocialLinks } from "@/features/site/queries";
import { isUuid } from "@/lib/utils";

export const metadata: Metadata = { title: "Editor de tema" };

export default async function ThemeEditorPage({ params }: PageProps<"/panel-interno/apariencia/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase, role } = await requireStaffPage();
  if (role !== "admin") redirect(adminHref("/apariencia"));

  const [{ data: theme }, { data: home }] = await Promise.all([
    supabase.from("themes").select("id, name, tokens, draft_tokens, is_active, is_preset, updated_at").eq("id", id).maybeSingle(),
    supabase.from("pages").select("id, published_revision_id").eq("slug", "inicio").maybeSingle(),
  ]);
  if (!theme) notFound();
  const tokens = parseTheme(theme.draft_tokens) ?? parseTheme(theme.tokens);
  if (!tokens) notFound();

  // La vista previa usa la portada publicada como contenido de ejemplo.
  const { data: rows } = home?.published_revision_id
    ? await supabase.from("page_blocks").select("id, type, props, is_hidden, visibility, schema_version").eq("revision_id", home.published_revision_id).order("position")
    : { data: [] };
  const blocks = blocksFromRows(rows ?? []).filter((b) => !b.isHidden);
  const [data, settings, header, footer, legal] = await Promise.all([loadBlockData(blocks), getSiteSettings(), getMenu("header"), getMenu("footer"), getMenu("legal")]);
  const logoMap = await getMediaMap([settings?.logo_media_id]);
  const nav = (items: typeof header) => items.map((i) => ({ id: i.id, label: i.label, href: i.href, newTab: i.open_in_new_tab }));

  return (
    <ThemeEditor
      key={`${theme.id}:${theme.updated_at}`}
      theme={{ id: theme.id, name: theme.name, tokens, hasDraft: theme.draft_tokens !== null, isActive: theme.is_active, isPreset: theme.is_preset }}
      preview={{
        blocks,
        data,
        siteName: settings?.site_name ?? "Residencia",
        tagline: settings?.tagline ?? "",
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        address: [settings?.address_line, [settings?.postal_code, settings?.city].filter(Boolean).join(" "), settings?.province].filter((v): v is string => Boolean(v)),
        hours: parseOpeningHours(settings?.opening_hours),
        social: parseSocialLinks(settings?.social_links),
        logo: settings?.logo_media_id ? (logoMap.get(settings.logo_media_id) ?? null) : null,
        header: nav(header),
        footer: nav(footer),
        legal: nav(legal),
      }}
    />
  );
}
