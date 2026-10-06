"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction, UserError, dbErrorMessage } from "@/features/auth/run-action";
import { eventInputSchema, moveEventSchema } from "./schema";
import { sanitizePlain, sanitizeRichText } from "@/lib/sanitize";
import { madridLocalToUtcIso, utcToMadridParts } from "@/lib/dates";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/action-result";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type Db = SupabaseClient<Database>;

async function uniqueEventSlug(db: Db, base: string, excludeId?: string) {
  const root = (base || "evento").slice(0, 90);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = db.from("events").select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q;
    if (!data?.length) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function revalidateEvents() {
  revalidatePath("/", "layout");
}

/** Instantes UTC de inicio y fin a partir de fechas/horas locales de Madrid. */
function toRange(allDay: boolean, sd: string, st: string, ed: string, et: string) {
  return allDay
    ? { starts_at: madridLocalToUtcIso(sd, "00:00"), ends_at: madridLocalToUtcIso(ed, "23:59", 59) }
    : { starts_at: madridLocalToUtcIso(sd, st), ends_at: madridLocalToUtcIso(ed, et) };
}

export type AdminCalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  status: "draft" | "published";
  color: string | null;
  category_id: string | null;
};

/** Eventos (incluidos borradores) visibles en el calendario del panel. */
export async function listAdminEvents(input: { from: string; to: string; category?: string; status?: string }): Promise<ActionResult<AdminCalendarEvent[]>> {
  const schema = z.object({
    from: z.iso.datetime({ offset: true }),
    to: z.iso.datetime({ offset: true }),
    category: z.uuid().or(z.literal("")).optional(),
    status: z.enum(["draft", "published", ""]).optional(),
  });
  return runAction(schema, input, async (d, { supabase }) => {
    let q = supabase
      .from("events")
      .select("id, title, starts_at, ends_at, all_day, status, category_id, category:event_categories(color)")
      .lte("starts_at", d.to)
      .gte("ends_at", d.from)
      .order("starts_at")
      .limit(500);
    if (d.category) q = q.eq("category_id", d.category);
    if (d.status) q = q.eq("status", d.status);
    const { data, error } = await q;
    if (error) throw new UserError(dbErrorMessage(error));
    return {
      ok: true,
      data: (data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        starts_at: e.starts_at,
        ends_at: e.ends_at,
        all_day: e.all_day,
        status: e.status,
        category_id: e.category_id,
        color: (e.category as { color: string } | null)?.color ?? null,
      })),
    };
  });
}

export async function saveEvent(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return runAction(eventInputSchema, input, async (d, { supabase, user }) => {
    const slug = await uniqueEventSlug(supabase, d.slug || slugify(d.title), d.id);
    const range = toRange(d.all_day, d.start_date, d.start_time, d.end_date, d.end_time);
    const row = {
      title: sanitizePlain(d.title),
      slug,
      summary: sanitizePlain(d.summary),
      description_html: sanitizeRichText(d.description_html),
      ...range,
      all_day: d.all_day,
      location: d.location ? sanitizePlain(d.location) : null,
      media_id: d.media_id,
      category_id: d.category_id,
      status: d.status,
      is_featured: d.is_featured,
      has_detail_page: d.has_detail_page,
      external_url: d.external_url || null,
      updated_by: user.id,
      is_demo: false,
    };
    let id = d.id;
    if (id) {
      const { error } = await supabase.from("events").update(row).eq("id", id);
      if (error) throw new UserError(dbErrorMessage(error));
    } else {
      const { data, error } = await supabase.from("events").insert({ ...row, created_by: user.id }).select("id").single();
      if (error) throw new UserError(dbErrorMessage(error));
      id = data.id;
    }
    revalidateEvents();
    return { ok: true, message: d.status === "published" ? "Evento guardado y publicado." : "Evento guardado como borrador.", data: { id, slug } };
  });
}

/** Mover (arrastrar y soltar) o alargar un evento en el calendario. */
export async function moveEvent(input: z.input<typeof moveEventSchema>): Promise<ActionResult> {
  return runAction(moveEventSchema, input, async (d, { supabase, user }) => {
    const { data: ev } = await supabase.from("events").select("starts_at, ends_at, all_day").eq("id", d.id).maybeSingle();
    if (!ev) throw new UserError("El evento ya no existe.");
    const oldStart = utcToMadridParts(ev.starts_at);
    const oldEnd = utcToMadridParts(ev.ends_at);
    let starts_at: string;
    let ends_at: string;
    if (d.end_date) {
      // Redimensionado: solo cambia la fecha final.
      starts_at = ev.starts_at;
      ends_at = ev.all_day ? madridLocalToUtcIso(d.end_date, "23:59", 59) : madridLocalToUtcIso(d.end_date, oldEnd.time);
    } else if (ev.all_day) {
      const days = Math.round((Date.parse(oldEnd.date) - Date.parse(oldStart.date)) / 86_400_000);
      const newEnd = new Date(Date.parse(d.start_date) + days * 86_400_000).toISOString().slice(0, 10);
      starts_at = madridLocalToUtcIso(d.start_date, "00:00");
      ends_at = madridLocalToUtcIso(newEnd, "23:59", 59);
    } else {
      const duration = Date.parse(ev.ends_at) - Date.parse(ev.starts_at);
      starts_at = madridLocalToUtcIso(d.start_date, d.start_time ?? oldStart.time);
      ends_at = new Date(Date.parse(starts_at) + duration).toISOString();
    }
    if (Date.parse(ends_at) < Date.parse(starts_at)) throw new UserError("El final no puede ser anterior al inicio.");
    const { error } = await supabase.from("events").update({ starts_at, ends_at, updated_by: user.id }).eq("id", d.id);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateEvents();
    return { ok: true, message: "Evento movido." };
  });
}

export async function duplicateEvent(id: string): Promise<ActionResult<{ id: string }>> {
  return runAction(z.uuid(), id, async (eventId, { supabase, user }) => {
    const { data: src } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
    if (!src) throw new UserError("El evento no existe.");
    const slug = await uniqueEventSlug(supabase, `${src.slug}-copia`);
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: `${src.title} (copia)`.slice(0, 200),
        slug,
        summary: src.summary,
        description_html: src.description_html,
        starts_at: src.starts_at,
        ends_at: src.ends_at,
        all_day: src.all_day,
        location: src.location,
        media_id: src.media_id,
        category_id: src.category_id,
        status: "draft",
        is_featured: false,
        has_detail_page: src.has_detail_page,
        external_url: src.external_url,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id")
      .single();
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateEvents();
    return { ok: true, message: "Copia creada como borrador.", data };
  });
}

export async function deleteEvents(ids: string[]): Promise<ActionResult> {
  return runAction(z.array(z.uuid()).min(1).max(200), ids, async (list, { supabase }) => {
    const { error } = await supabase.from("events").delete().in("id", list);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateEvents();
    return { ok: true, message: list.length === 1 ? "Evento eliminado." : `${list.length} eventos eliminados.` };
  });
}

export async function setEventStatus(input: { ids: string[]; status: "draft" | "published" }): Promise<ActionResult> {
  const schema = z.object({ ids: z.array(z.uuid()).min(1).max(200), status: z.enum(["draft", "published"]) });
  return runAction(schema, input, async ({ ids, status }, { supabase, user }) => {
    const { error } = await supabase.from("events").update({ status, updated_by: user.id }).in("id", ids);
    if (error) throw new UserError(dbErrorMessage(error));
    revalidateEvents();
    return { ok: true, message: status === "published" ? "Evento publicado." : "Evento pasado a borrador." };
  });
}
