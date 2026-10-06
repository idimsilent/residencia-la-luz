import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SetupRequired } from "@/components/public/setup-required";
import type { NavItem } from "@/components/public/nav-links";
import { isSupabaseConfigured, env } from "@/lib/env";
import {
  getActiveTheme,
  getMediaMap,
  getMenu,
  getSiteSettings,
  parseOpeningHours,
  parseSocialLinks,
  type MenuItem,
} from "@/features/site/queries";
import { themeDataAttributes, themeToCss } from "@/features/theme/css";
import { getPreview } from "@/lib/preview";
import { mediaPublicUrl } from "@/features/media/url";

// Contenido siempre actualizado desde la base de datos.
export const dynamic = "force-dynamic";

function toNav(items: MenuItem[]): NavItem[] {
  return items.map((i) => ({ id: i.id, label: i.label, href: i.href, newTab: i.open_in_new_tab }));
}

export async function generateMetadata(): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Configuración pendiente" };
  const s = await getSiteSettings();
  const media = await getMediaMap([s?.favicon_media_id, s?.og_media_id]);
  const favicon = s?.favicon_media_id ? media.get(s.favicon_media_id) : null;
  const og = s?.og_media_id ? media.get(s.og_media_id) : null;
  const name = s?.site_name ?? "Residencia";
  return {
    title: { default: s?.seo_title || name, template: `%s · ${name}` },
    description: s?.seo_description || undefined,
    applicationName: name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: name,
      url: env.siteUrl,
      images: og ? [{ url: mediaPublicUrl(og.storage_path), alt: og.alt_text }] : undefined,
    },
    icons: favicon ? { icon: mediaPublicUrl(favicon.storage_path) } : undefined,
  };
}

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  if (!isSupabaseConfigured()) return <SetupRequired />;

  const [settings, theme, header, footer, legal, preview] = await Promise.all([
    getSiteSettings(),
    getActiveTheme(),
    getMenu("header"),
    getMenu("footer"),
    getMenu("legal"),
    getPreview(),
  ]);
  const media = await getMediaMap([settings?.logo_media_id]);
  const logo = settings?.logo_media_id ? (media.get(settings.logo_media_id) ?? null) : null;
  const t = theme.tokens;
  const address = [
    settings?.address_line,
    [settings?.postal_code, settings?.city].filter(Boolean).join(" "),
    settings?.province,
  ].filter((v): v is string => Boolean(v));

  return (
    <div {...themeDataAttributes(t)} className="flex min-h-screen flex-col">
      {/* Variables CSS del tema activo (valores validados con zod). */}
      <style dangerouslySetInnerHTML={{ __html: themeToCss(t) }} />
      {preview.enabled ? (
        <div className="sticky top-0 z-[60] bg-[#2b2f2a] px-4 py-2 text-center text-sm text-white" role="status">
          Vista previa {theme.previewName ? `del tema «${theme.previewName}»` : "de borradores"}: solo tú ves estos cambios.{" "}
          <Link href="/api/preview/salir" prefetch={false} className="font-semibold underline">
            Salir de la vista previa
          </Link>
        </div>
      ) : null}
      {settings?.show_demo_notice ? (
        <div className="bg-accent/15 px-4 py-2 text-center text-xs text-ink sm:text-sm">
          Web en preparación: los textos, datos e imágenes son <strong>contenido de demostración</strong>.
        </div>
      ) : null}
      <SiteHeader
        siteName={settings?.site_name ?? "Residencia"}
        logo={logo}
        items={toNav(header)}
        phone={settings?.phone ?? ""}
        layout={t.components.headerLayout}
        sticky={t.components.headerSticky}
      />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter
        siteName={settings?.site_name ?? "Residencia"}
        tagline={settings?.tagline ?? ""}
        address={address}
        phone={settings?.phone ?? ""}
        email={settings?.email ?? ""}
        hours={parseOpeningHours(settings?.opening_hours)}
        social={parseSocialLinks(settings?.social_links)}
        mainLinks={toNav(footer)}
        legalLinks={toNav(legal)}
        layout={t.components.footerLayout}
      />
    </div>
  );
}
