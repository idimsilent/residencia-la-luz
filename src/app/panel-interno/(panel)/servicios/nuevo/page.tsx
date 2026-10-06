import type { Metadata } from "next";
import { requireStaffPage } from "@/features/auth/session";
import { ServiceForm } from "@/components/admin/services/service-form";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default async function NewServicePage() {
  await requireStaffPage();
  return <ServiceForm initial={{ title: "", slug: "", summary: "", content_html: "", icon: "heart", media: null, status: "draft" }} />;
}
