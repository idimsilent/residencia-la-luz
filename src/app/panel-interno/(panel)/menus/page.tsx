import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { MenuEditor } from "@/components/admin/settings/menu-editor";
import { AdminOnly } from "@/features/admin/guards";

export const metadata: Metadata = { title: "Menús y navegación" };

export default async function MenusPage() {
  const { supabase, role } = await requireStaffPage();
  if (role !== "admin") return <AdminOnly title="Menús y navegación" />;
  const [{ data: items }, { data: pages }] = await Promise.all([
    supabase.from("menu_items").select("id, location, label, href, is_visible, is_system, open_in_new_tab").order("sort_order"),
    supabase.from("pages").select("title, slug").eq("status", "published").order("title"),
  ]);
  const pageOptions = [
    ...(pages ?? []).map((p) => ({ title: p.title, path: p.slug === "inicio" ? "/" : `/${p.slug}` })),
  ];
  const by = (loc: string) => (items ?? []).filter((i) => i.location === loc);
  return (
    <>
      <PageHeader title="Menús y navegación" description="Ordena los enlaces arrastrándolos. Los enlaces principales se pueden ocultar pero no borrar, para que la web siempre tenga una navegación completa." />
      <div className="space-y-6">
        <MenuEditor location="header" initial={by("header")} pages={pageOptions} />
        <MenuEditor location="footer" initial={by("footer")} pages={pageOptions} />
        <MenuEditor location="legal" initial={by("legal")} pages={pageOptions} />
      </div>
    </>
  );
}
