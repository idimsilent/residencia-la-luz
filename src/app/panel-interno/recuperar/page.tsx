import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { ResetRequestForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default async function ResetPage(props: PageProps<"/panel-interno/recuperar">) {
  const sp = await props.searchParams;
  return (
    <AuthCard title="Recuperar contraseña" subtitle="Te enviaremos un enlace seguro para crear una nueva contraseña.">
      <ResetRequestForm linkError={sp.error === "enlace"} />
    </AuthCard>
  );
}
