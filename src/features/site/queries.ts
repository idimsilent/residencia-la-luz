import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { getPreview } from "@/lib/preview";
import { parseTheme, type ThemeTokens } from "@/features/theme/schema";
import { SALVIA_THEME } from "@/features/theme/presets";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { blocksFromRows, type AnyBlock } from "@/features/blocks/schema";
import type { Database } from "@/types/database";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type PageRow = Database["public"]["Tables"]["pages"]["Row"];

export type OpeningHour = { label: string; hours: string };
export type SocialLink = { network: string; url: string };

/** Cliente de lectura: anónimo, o con sesión si hay vista previa autorizada. */
export const getReader = cache(async () => {
  const preview = await getPreview();
  return preview.enabled ? await createClient() : createPublicClient();
});

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const db = createPublicClient();
  const { data } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
});

export function parseOpeningHours(value: unknown): OpeningHour[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is OpeningHour => typeof v?.label === "string" && typeof v?.hours === "string")
    .slice(0, 10);
}

export function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is SocialLink =>
        typeof v?.network === "string" && typeof v?.url === "string" && v.url.startsWith("https://"),
    )
    .slice(0, 10);
}

/** Tema activo (o el borrador del tema en vista previa). */
export const getActiveTheme = cache(async (): Promise<{ tokens: ThemeTokens; previewName: string | null }> => {
  const preview = await getPreview();
  if (preview.enabled && preview.themeId) {
    const db = await createClient();
    const { data } = await db
      .from("themes")
      .select("name, tokens, draft_tokens")
      .eq("id", preview.themeId)
      .maybeSingle();
    const tokens = parseTheme(data?.draft_tokens ?? data?.tokens);
    if (tokens && data) return { tokens, previewName: data.name };
  }
  const db = createPublicClient();
  const { data } = await db.from("themes").select("tokens").eq("is_active", true).maybeSingle();
  return { tokens: parseTheme(data?.tokens) ?? SALVIA_THEME, previewName: null };
});

export const getMenu = cache(async (location: "header" | "footer" | "legal"): Promise<MenuItem[]> => {
  const db = createPublicClient();
  const { data } = await db
    .from("menu_items")
    .select("*")
    .eq("location", location)
    .eq("is_visible", true)
    .order("sort_order");
  return data ?? [];
});

export const getMediaByIds = cache(async (idsKey: string): Promise<Map<string, MediaLite>> => {
  const ids = idsKey ? idsKey.split(",") : [];
  const map = new Map<string, MediaLite>();
  if (ids.length === 0) return map;
  const db = createPublicClient();
  const { data } = await db.from("media").select(MEDIA_LITE_COLUMNS).in("id", ids);
  for (const m of data ?? []) map.set(m.id, m);
  return map;
});

export async function getMediaMap(ids: (string | null | undefined)[]): Promise<Map<string, MediaLite>> {
  const unique = [...new Set(ids.filter((v): v is string => Boolean(v)))].sort();
  return getMediaByIds(unique.join(","));
}

export type ResolvedPage = { page: PageRow; blocks: AnyBlock[]; isPreview: boolean };

/**
 * Página por slug con sus bloques publicados. En vista previa autorizada
 * devuelve el borrador (bloques con revision_id NULL).
 */
export const getPageBySlug = cache(async (slug: string): Promise<ResolvedPage | null> => {
  const preview = await getPreview();
  const db = await getReader();
  const { data: page } = await db.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (!page) return null;
  if (!preview.enabled && page.status !== "published") return null;

  let query = db
    .from("page_blocks")
    .select("id, type, props, is_hidden, visibility, schema_version, position")
    .eq("page_id", page.id)
    .order("position");
  if (preview.enabled) {
    query = query.is("revision_id", null);
  } else if (page.published_revision_id) {
    query = query.eq("revision_id", page.published_revision_id);
  } else {
    return { page, blocks: [], isPreview: false };
  }
  const { data: rows } = await query;
  const blocks = blocksFromRows(rows ?? []).filter((b) => !b.isHidden);
  return { page, blocks, isPreview: preview.enabled };
});
