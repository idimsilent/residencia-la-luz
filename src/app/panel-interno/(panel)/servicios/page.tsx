import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { ServicesManager } from "@/components/admin/services/services-manager";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServicesAdminPage() {
  const { supabase } = await requireStaffPage();
  const { data } = await supabase.from("services").select("id, title, summary, icon, status, is_demo").order("sort_order").order("title");
  return (
    <>
      <PageHeader
        title="Servicios"
        description="Los servicios que ofrece el centro. Describe solo lo que realmente se ofrece."
        actions={
          <LinkButton href={adminHref("/servicios/nuevo")}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo servicio
          </LinkButton>
        }
      />
      <ServicesManager initial={data ?? []} />
    </>
  );
}
