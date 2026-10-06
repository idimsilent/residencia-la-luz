import "server-only";
import { cache } from "react";
import { cookies, draftMode } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const PREVIEW_THEME_COOKIE = "lluz_preview_theme";

/**
 * Modo vista previa: solo se activa si draftMode está habilitado Y la sesión
 * actual pertenece a una cuenta con rol de administración. Así un visitante
 * no puede ver borradores aunque manipule cookies.
 */
export const getPreview = cache(async (): Promise<{ enabled: boolean; themeId: string | null }> => {
  if (!isSupabaseConfigured()) return { enabled: false, themeId: null };
  const draft = await draftMode();
  if (!draft.isEnabled) return { enabled: false, themeId: null };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("is_staff");
    if (error || data !== true) return { enabled: false, themeId: null };
    const store = await cookies();
    const themeId = store.get(PREVIEW_THEME_COOKIE)?.value ?? null;
    return { enabled: true, themeId };
  } catch {
    return { enabled: false, themeId: null };
  }
});
