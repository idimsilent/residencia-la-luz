import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { CenterForm } from "@/components/admin/settings/center-form";
import { AdminOnly } from "@/features/admin/guards";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { parseOpeningHours, parseSocialLinks } from "@/features/site/queries";
import { SOCIAL_NETWORKS } from "@/components/public/social-icon";

export const metadata: Metadata = { title: "Información del centro" };

export default async function CenterPage() {
  const { supabase, role } = await requireStaffPage();
  if (role !== "admin") return <AdminOnly title="Información del centro" />;
  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const ids = [s?.logo_media_id, s?.favicon_media_id].filter((v): v is string => Boolean(v));
  const { data: media } = ids.length ? await supabase.from("media").select(MEDIA_LITE_COLUMNS).in("id", ids) : { data: [] as MediaLite[] };
  const find = (id: string | null | undefined) => (media ?? []).find((m) => m.id === id) ?? null;
  const networks = SOCIAL_NETWORKS.map((n) => n.value) as string[];

  return (
    <>
      <PageHeader title="Información del centro" description="Datos que aparecen en la cabecera, el pie, la página de contacto y los textos legales." />
      <CenterForm
        initial={{
          site_name: s?.site_name ?? "",
          tagline: s?.tagline ?? "",
          logo: find(s?.logo_media_id),
          favicon: find(s?.favicon_media_id),
          phone: s?.phone ?? "",
          phone_secondary: s?.phone_secondary ?? "",
          email: s?.email ?? "",
          address_line: s?.address_line ?? "",
          postal_code: s?.postal_code ?? "",
          city: s?.city ?? "",
          province: s?.province ?? "",
          map_url: s?.map_url ?? "",
          opening_hours: parseOpeningHours(s?.opening_hours),
          social_links: parseSocialLinks(s?.social_links).filter((l) => networks.includes(l.network)) as { network: (typeof SOCIAL_NETWORKS)[number]["value"]; url: string }[],
          contact_form_enabled: s?.contact_form_enabled ?? true,
          testimonials_enabled: s?.testimonials_enabled ?? false,
          contact_privacy_note: s?.contact_privacy_note ?? "",
          legal_owner_name: s?.legal_owner_name ?? "",
          legal_owner_tax_id: s?.legal_owner_tax_id ?? "",
          show_demo_notice: s?.show_demo_notice ?? true,
        }}
      />
    </>
  );
}
