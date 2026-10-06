import { z } from "zod";
import { SLUG_REGEX } from "@/lib/utils";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida");
const timeStr = z.string().regex(/^\d{2}:\d{2}$/, "Hora no válida");
const optionalUuid = z.uuid().nullable().optional().transform((v) => v ?? null);

export const eventInputSchema = z
  .object({
    id: z.uuid().optional(),
    title: z.string().trim().min(2, "Escribe un título").max(200, "Máximo 200 caracteres"),
    slug: z.string().trim().max(100).regex(SLUG_REGEX, "Solo minúsculas, números y guiones").or(z.literal("")),
    summary: z.string().trim().max(300, "Máximo 300 caracteres"),
    description_html: z.string().max(100_000),
    all_day: z.boolean(),
    start_date: dateStr,
    start_time: timeStr.or(z.literal("")),
    end_date: dateStr,
    end_time: timeStr.or(z.literal("")),
    location: z.string().trim().max(200),
    media_id: optionalUuid,
    category_id: optionalUuid,
    status: z.enum(["draft", "published"]),
    is_featured: z.boolean(),
    has_detail_page: z.boolean(),
    external_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "El enlace debe empezar por https://"),
  })
  .superRefine((d, ctx) => {
    if (!d.all_day && (!d.start_time || !d.end_time)) {
      ctx.addIssue({ code: "custom", path: ["start_time"], message: "Indica la hora de inicio y de fin" });
    }
    const start = `${d.start_date}T${d.all_day ? "00:00" : d.start_time}`;
    const end = `${d.end_date}T${d.all_day ? "23:59" : d.end_time}`;
    if (end < start) ctx.addIssue({ code: "custom", path: ["end_date"], message: "El final no puede ser anterior al inicio" });
  });

export type EventInput = z.input<typeof eventInputSchema>;

export const moveEventSchema = z.object({
  id: z.uuid(),
  /** Nueva fecha/hora de inicio en hora de Madrid. Se conserva la duración. */
  start_date: dateStr,
  start_time: timeStr.optional(),
  /** Si se indica, nueva fecha final (redimensionado). */
  end_date: dateStr.optional(),
});
