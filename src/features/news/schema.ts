import { z } from "zod";
import { SLUG_REGEX } from "@/lib/utils";

export const NEWS_MODES = ["draft", "publish", "schedule", "archive"] as const;

const optionalUuid = z.uuid().nullable().optional().transform((v) => v ?? null);

export const newsInputSchema = z
  .object({
    id: z.uuid().optional(),
    title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(200, "Máximo 200 caracteres"),
    slug: z.string().trim().max(100).regex(SLUG_REGEX, "Solo minúsculas, números y guiones").or(z.literal("")),
    excerpt: z.string().trim().max(500, "Máximo 500 caracteres"),
    content_html: z.string().max(200_000, "El contenido es demasiado largo"),
    featured_media_id: optionalUuid,
    gallery_ids: z.array(z.uuid()).max(24),
    category_id: optionalUuid,
    author_name: z.string().trim().max(120),
    mode: z.enum(NEWS_MODES),
    scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
    scheduled_time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
    is_featured: z.boolean(),
    seo_title: z.string().trim().max(70, "Máximo 70 caracteres"),
    seo_description: z.string().trim().max(170, "Máximo 170 caracteres"),
  })
  .superRefine((d, ctx) => {
    if (d.mode === "schedule" && (!d.scheduled_date || !d.scheduled_time)) {
      ctx.addIssue({ code: "custom", path: ["scheduled_date"], message: "Indica la fecha y hora de publicación" });
    }
  });

export type NewsInput = z.input<typeof newsInputSchema>;

export const quickPostSchema = z.object({
  title: z.string().trim().min(3, "Escribe un título").max(200),
  text: z.string().trim().max(5000),
  media_id: optionalUuid,
  category_id: optionalUuid,
  publish: z.boolean(),
});
