import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { PagesTable } from "@/components/admin/pages/pages-table";

export const metadata: Metadata = { title: "Páginas" };

export default async function PagesAdminPage() {
  const { supabase, role } = await requireStaffPage();
  const { data } = await supabase.from("pages").select("id, title, slug, is_system, status, has_unpublished_changes, updated_at").order("is_system", { ascending: false }).order("title");
  const order = ["inicio", "conocenos", "servicios", "instalaciones", "noticias", "eventos", "contacto"];
  const rows = (data ?? [])
    .map((p) => ({ ...p, path: p.slug === "inicio" ? "/" : `/${p.slug}` }))
    .sort((a, b) => {
      const ia = order.indexOf(a.slug);
      const ib = order.indexOf(b.slug);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return Number(b.is_system) - Number(a.is_system) || a.title.localeCompare(b.title, "es");
    });
  return (
    <>
      <PageHeader title="Páginas" description="Edita el contenido de cada página con bloques visuales. Los cambios no se ven en la web hasta que pulses «Publicar»." />
      <PagesTable rows={rows} isAdmin={role === "admin"} />
    </>
  );
}
