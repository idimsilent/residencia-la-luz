import type { Metadata } from "next";
import { SetupRequired } from "@/components/public/setup-required";
import { AdminBaseProvider, AdminProviders } from "@/components/admin/ui";
import { isSupabaseConfigured } from "@/lib/env";
import { getAdminBasePath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Panel de gestión", template: "%s · Panel de gestión" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired area="panel" />;
  return (
    <div className="admin-shell min-h-screen">
      <AdminBaseProvider base={getAdminBasePath()}>
        <AdminProviders>{children}</AdminProviders>
      </AdminBaseProvider>
    </div>
  );
}
