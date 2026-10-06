import { AdminSidebar } from "@/components/admin/sidebar";
import { AuthCard } from "@/components/admin/auth-card";
import { requireStaffPage } from "@/features/auth/session";
import { signOut } from "@/features/auth/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffPage();
  if (!session.role) {
    return (
      <AuthCard title="Sin permisos" subtitle={session.user.email}>
        <p className="text-sm text-stone-700">
          Tu cuenta existe, pero no tiene un rol asignado para gestionar la web. Pide a una persona administradora que te
          conceda acceso.
        </p>
        <form action={signOut} className="mt-5">
          <button type="submit" className="w-full rounded-lg bg-sage-600 px-4 py-2.5 font-bold text-white">
            Cerrar sesión
          </button>
        </form>
      </AuthCard>
    );
  }
  const [{ data: settings }, { count }] = await Promise.all([
    session.supabase.from("site_settings").select("site_name").eq("id", 1).maybeSingle(),
    session.supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return (
    <div className="lg:flex">
      <AdminSidebar
        userLabel={session.profile?.full_name || session.user.email || "Usuario"}
        role={session.role}
        siteName={settings?.site_name ?? "Residencia"}
        newMessages={count ?? 0}
      />
      <main id="contenido" className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
