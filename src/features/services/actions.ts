"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { sanitizePlain, sanitizeRichText } from "@/lib/sanitize";
import { slugify, SLUG_REGEX } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";

const serviceSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(2, "Escribe un nombre").max(120, "Máximo 120 caracteres"),
  slug: z.string().trim().max(100).regex(SLUG_REGEX, "Solo minúsculas, números y guiones").or(z.literal("")),
  summary: z.string().trim().max(400, "Máximo 400 caracteres"),
  content_html: z.string().max(100_000),
  icon: z.string().regex(/^[a-z0-9-]{1,40}$/),
  media_id: z.uuid().nullable(),
  status: z.enum(["draft", "published"]),
});

export async function saveService(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(serviceSchema, input, async (d, { supabase }) => {
    const base = (d.slug || slugify(d.title)).slice(0, 90) || "servicio";
    let slug = base;
    for (let i = 2; i < 50; i++) {
      let q = supabase.from("services").select("id").eq("slug", slug).limit(1);
      if (d.id) q = q.neq("id", d.id);
      const { data } = await q;
      if (!data?.length) break;
      slug = `${base}-${i}`;
    }
    const row = {
      title: sanitizePlain(d.title),
      slug,
      summary: sanitizePlain(d.summary),
      content_html: sanitizeRichText(d.content_html),
      icon: d.icon,
      media_id: d.media_id,
      status: d.status,
      is_demo: false,
    };
    let id = d.id;
    if (id) {
      const { error } = await supabase.from("services").update(row).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
    } else {
      const { data: last } = await supabase.from("services").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const { data, error } = await supabase
        .from("services")
        .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 10 })
        .select("id")
        .single();
      if (error) throw new UserError(dbErrorMessage(error));
      id = data.id;
    }
    revalidatePath("/", "layout");
    return { ok: true, message: d.status === "published" ? "Servicio publicado." : "Servicio guardado como borrador.", data: { id, slug } };
  });
}

export async function reorderServices(ids: string[]): Promise<ActionResult> {
  return runAction(z.array(z.uuid()).min(1).max(200), ids, async (list, { supabase }) => {
    for (const [i, id] of list.entries()) {
      const { error } = await supabase.from("services").update({ sort_order: (i + 1) * 10 }).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
    }
    revalidatePath("/", "layout");
    return { ok: true, message: "Orden guardado." };
  });
}

export async function setServiceStatus(input: { id: string; status: "draft" | "published" }): Promise<ActionResult> {
  return runAction(z.object({ id: z.uuid(), status: z.enum(["draft", "published"]) }), input, async ({ id, status }, { supabase }) => {
    const { error } = await supabase.from("services").update({ status }).eq("id", id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidatePath("/", "layout");
    return { ok: true, message: status === "published" ? "Servicio visible en la web." : "Servicio oculto de la web." };
  });
}

export async function deleteService(id: string): Promise<ActionResult> {
  return runAction(z.uuid(), id, async (serviceId, { supabase }) => {
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidatePath("/", "layout");
    return { ok: true, message: "Servicio eliminado." };
  });
}
