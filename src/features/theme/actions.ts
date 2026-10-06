"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { parseTheme, themeTokensSchema } from "./schema";
import type { ActionResult } from "@/lib/action-result";
import type { Json } from "@/types/database";

// La apariencia la gestiona solo el rol administrador.
const ADMIN = "admin" as const;

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function saveThemeDraft(input: { id: string; name: string; tokens: unknown }): Promise<ActionResult> {
  const schema = z.object({ id: z.uuid(), name: z.string().trim().min(1, "Pon un nombre al tema").max(80), tokens: themeTokensSchema });
  return runAction(
    schema,
    input,
    async ({ id, name, tokens }, { supabase }) => {
      const { error } = await supabase.from("themes").update({ name, draft_tokens: tokens as unknown as NonNullable<Json> }).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: "Borrador del tema guardado." };
    },
    ADMIN,
  );
}

/** Publica el borrador: pasa a ser la versión vigente del tema (y lo activa si se pide). */
export async function publishTheme(input: { id: string; name: string; tokens: unknown; activate: boolean }): Promise<ActionResult> {
  const schema = z.object({ id: z.uuid(), name: z.string().trim().min(1).max(80), tokens: themeTokensSchema, activate: z.boolean() });
  return runAction(
    schema,
    input,
    async ({ id, name, tokens, activate }, { supabase }) => {
      const { error } = await supabase.from("themes").update({ name, tokens: tokens as unknown as NonNullable<Json>, draft_tokens: null }).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
      if (activate) {
        const { error: e2 } = await supabase.rpc("activate_theme", { p_theme_id: id });
        if (e2) throw new UserError(dbErrorMessage(e2));
      }
      revalidateSite();
      return { ok: true, message: activate ? "Tema publicado y aplicado a la web." : "Tema guardado." };
    },
    ADMIN,
  );
}

export async function discardThemeDraft(id: string): Promise<ActionResult> {
  return runAction(
    z.uuid(),
    id,
    async (themeId, { supabase }) => {
      const { error } = await supabase.from("themes").update({ draft_tokens: null }).eq("id", themeId);
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: "Cambios descartados." };
    },
    ADMIN,
  );
}

/** Restablece los valores originales del tema (como borrador, para revisarlos antes). */
export async function resetThemeDraft(id: string): Promise<ActionResult> {
  return runAction(
    z.uuid(),
    id,
    async (themeId, { supabase }) => {
      const { data } = await supabase.from("themes").select("original_tokens").eq("id", themeId).maybeSingle();
      if (!data) throw new UserError("El tema no existe.");
      const { error } = await supabase.from("themes").update({ draft_tokens: data.original_tokens }).eq("id", themeId);
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: "Valores originales recuperados como borrador. Publica para aplicarlos." };
    },
    ADMIN,
  );
}

export async function activateTheme(id: string): Promise<ActionResult> {
  return runAction(
    z.uuid(),
    id,
    async (themeId, { supabase }) => {
      const { error } = await supabase.rpc("activate_theme", { p_theme_id: themeId });
      if (error) throw new UserError(dbErrorMessage(error));
      revalidateSite();
      return { ok: true, message: "Tema aplicado a la web." };
    },
    ADMIN,
  );
}

export async function duplicateTheme(id: string): Promise<ActionResult<{ id: string }>> {
  return runAction(
    z.uuid(),
    id,
    async (themeId, { supabase }) => {
      const { data: src } = await supabase.from("themes").select("name, tokens, draft_tokens").eq("id", themeId).maybeSingle();
      if (!src) throw new UserError("El tema no existe.");
      const tokens = parseTheme(src.draft_tokens) ?? parseTheme(src.tokens);
      if (!tokens) throw new UserError("El tema original tiene datos no válidos.");
      const { data, error } = await supabase
        .from("themes")
        .insert({ name: `${src.name} (copia)`.slice(0, 80), tokens: tokens as unknown as NonNullable<Json>, original_tokens: tokens as unknown as NonNullable<Json>, is_preset: false, is_active: false })
        .select("id")
        .single();
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: "Copia creada.", data };
    },
    ADMIN,
  );
}

export async function deleteTheme(id: string): Promise<ActionResult> {
  return runAction(
    z.uuid(),
    id,
    async (themeId, { supabase }) => {
      const { data } = await supabase.from("themes").select("is_active, is_preset").eq("id", themeId).maybeSingle();
      if (!data) throw new UserError("El tema no existe.");
      if (data.is_active) throw new UserError("No se puede borrar el tema que está aplicado en la web.");
      if (data.is_preset) throw new UserError("Los temas predefinidos no se pueden borrar; duplica uno para personalizarlo.");
      const { error } = await supabase.from("themes").delete().eq("id", themeId);
      if (error) throw new UserError(dbErrorMessage(error));
      return { ok: true, message: "Tema eliminado." };
    },
    ADMIN,
  );
}
