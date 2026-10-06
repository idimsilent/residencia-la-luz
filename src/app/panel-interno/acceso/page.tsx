import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { LoginForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Acceso" };

export default async function LoginPage(props: PageProps<"/panel-interno/acceso">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <AuthCard title="Iniciar sesión" subtitle="Acceso exclusivo para el personal autorizado.">
      <LoginForm next={next} />
    </AuthCard>
  );
}
