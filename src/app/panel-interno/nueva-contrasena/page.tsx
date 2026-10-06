import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/auth-card";
import { NewPasswordForm } from "@/components/admin/auth-forms";
import { getSession } from "@/features/auth/session";
import { getAdminBasePath } from "@/lib/admin-path";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function NewPasswordPage() {
  const session = await getSession();
  if (!session) redirect(`${getAdminBasePath()}/recuperar?error=enlace`);
  return (
    <AuthCard title="Crea una nueva contraseña" subtitle={session.user.email}>
      <NewPasswordForm />
    </AuthCard>
  );
}
