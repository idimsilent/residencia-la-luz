import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { getPageBySlug } from "@/features/site/queries";
import { pageMetadata } from "@/features/pages/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("inicio", "Inicio", "/");
}

export default async function HomePage() {
  const resolved = await getPageBySlug("inicio");
  if (!resolved) notFound();
  return <BlocksRenderer blocks={resolved.blocks} />;
}
