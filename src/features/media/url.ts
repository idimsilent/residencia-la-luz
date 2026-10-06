import { normalizeSupabaseUrl } from "@/lib/supabase-url";

/** URL pública de un recurso multimedia a partir de su ruta de almacenamiento. */
export function mediaPublicUrl(storagePath: string): string {
  // Imágenes de demostración incluidas en /public/demo.
  if (storagePath.startsWith("demo/")) return `/${storagePath}`;
  const base = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "";
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/media/${encoded}`;
}

export type MediaLite = {
  id: string;
  storage_path: string;
  alt_text: string;
  title: string;
  width: number | null;
  height: number | null;
  mime_type: string;
  is_demo: boolean;
};

export const MEDIA_LITE_COLUMNS = "id, storage_path, alt_text, title, width, height, mime_type, is_demo";
