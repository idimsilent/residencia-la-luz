import type { Metadata } from "next";
import Link from "next/link";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";
import { PageHeader } from "@/components/admin/ui";
import { MessagesList } from "@/components/admin/settings/messages-list";
import { formatDateTime } from "@/lib/dates";

export const metadata: Metadata = { title: "Mensajes de contacto" };

export default async function MessagesPage({ searchParams }: PageProps<"/panel-interno/mensajes">) {
  const { supabase, role } = await requireStaffPage();
  const archived = (await searchParams).ver === "archivados";
  let q = supabase.from("contact_messages").select("id, name, email, phone, subject, message, status, created_at").order("created_at", { ascending: false }).limit(200);
  q = archived ? q.eq("status", "archived") : q.neq("status", "archived");
  const { data } = await q;
  const tab = (active: boolean) => `rounded-lg px-4 py-2 text-sm font-bold ${active ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"}`;
  return (
    <>
      <PageHeader
        title="Mensajes de contacto"
        description="Mensajes recibidos desde el formulario de la web. Contienen datos personales: trátalos con confidencialidad y bórralos cuando ya no sean necesarios."
      />
      <nav className="mb-4 inline-flex rounded-xl bg-stone-200/70 p-1" aria-label="Bandejas">
        <Link href={adminHref("/mensajes")} prefetch={false} className={tab(!archived)} aria-current={!archived ? "page" : undefined}>
          Bandeja de entrada
        </Link>
        <Link href={adminHref("/mensajes?ver=archivados")} prefetch={false} className={tab(archived)} aria-current={archived ? "page" : undefined}>
          Archivados
        </Link>
      </nav>
      <MessagesList isAdmin={role === "admin"} rows={(data ?? []).map((m) => ({ ...m, when: formatDateTime(m.created_at) }))} />
    </>
  );
}
