import { redirect } from "next/navigation";
import { requireStaffPage } from "@/features/auth/session";
import { adminHref } from "@/features/auth/admin-links";

/** Editores a pantalla completa (sin menú lateral). */
export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffPage();
  if (!session.role) redirect(adminHref());
  return <main id="contenido">{children}</main>;
}
