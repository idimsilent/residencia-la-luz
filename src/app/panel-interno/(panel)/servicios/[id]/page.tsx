import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { ServiceForm } from "@/components/admin/services/service-form";
import { MEDIA_LITE_COLUMNS, type MediaLite } from "@/features/media/url";
import { isUuid } from "@/lib/utils";

export const metadata: Metadata = { title: "Editar servicio" };

export default async function EditServicePage({ params }: PageProps<"/panel-interno/servicios/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireStaffPage();
  const { data: s } = await supabase.from("services").select(`*, media(${MEDIA_LITE_COLUMNS})`).eq("id", id).maybeSingle();
  if (!s) notFound();
  return (
    <ServiceForm
      key={s.updated_at}
      initial={{ id: s.id, title: s.title, slug: s.slug, summary: s.summary, content_html: s.content_html, icon: s.icon, media: (s.media as MediaLite | null) ?? null, status: s.status }}
    />
  );
}
