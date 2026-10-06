import "server-only";
import { Notice, PageHeader } from "@/components/admin/ui";

/** Pantalla para secciones reservadas al rol administrador. */
export function AdminOnly({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Notice tone="warning">Esta sección solo está disponible para cuentas con rol de administración.</Notice>
    </>
  );
}
