import { describe, expect, it } from "vitest";
import { contactSchema } from "@/features/contact/schema";
import { newsInputSchema } from "@/features/news/schema";
import { eventInputSchema } from "@/features/events/schema";
import { normalizeAdminPath } from "@/lib/admin-path";
import { slugify } from "@/lib/utils";

describe("formulario de contacto", () => {
  const ok = { name: "Ana", email: "ana@example.com", message: "Quisiera información sobre visitas.", privacy: "on" };
  it("acepta datos válidos", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("exige aceptar la privacidad", () => expect(contactSchema.safeParse({ ...ok, privacy: undefined }).success).toBe(false));
  it("valida el correo", () => expect(contactSchema.safeParse({ ...ok, email: "no-es-correo" }).success).toBe(false));
});

describe("noticias", () => {
  const base = {
    title: "Una noticia", slug: "", excerpt: "", content_html: "<p>x</p>", gallery_ids: [], author_name: "",
    mode: "draft", is_featured: false, seo_title: "", seo_description: "",
  };
  it("un borrador es válido", () => expect(newsInputSchema.safeParse(base).success).toBe(true));
  it("programar exige fecha y hora", () => expect(newsInputSchema.safeParse({ ...base, mode: "schedule" }).success).toBe(false));
  it("programar con fecha es válido", () =>
    expect(newsInputSchema.safeParse({ ...base, mode: "schedule", scheduled_date: "2030-01-01", scheduled_time: "10:00" }).success).toBe(true));
  it("rechaza slugs con caracteres no válidos", () => expect(newsInputSchema.safeParse({ ...base, slug: "Hola Mundo" }).success).toBe(false));
});

describe("eventos", () => {
  const base = {
    title: "Taller", slug: "", summary: "", description_html: "", all_day: false, start_date: "2026-10-10", start_time: "17:00",
    end_date: "2026-10-10", end_time: "18:00", location: "", media_id: null, category_id: null, status: "draft",
    is_featured: false, has_detail_page: true, external_url: "",
  };
  it("acepta un evento válido", () => expect(eventInputSchema.safeParse(base).success).toBe(true));
  it("el final no puede ser anterior al inicio", () => expect(eventInputSchema.safeParse({ ...base, end_time: "16:00" }).success).toBe(false));
  it("el enlace externo debe ser https", () => expect(eventInputSchema.safeParse({ ...base, external_url: "http://x.es" }).success).toBe(false));
});

describe("utilidades", () => {
  it("slugify quita tildes y espacios", () => expect(slugify("Días con propósito ¡en otoño!")).toBe("dias-con-proposito-en-otono"));
  it("ADMIN_PATH se normaliza y no puede pisar rutas públicas", () => {
    expect(normalizeAdminPath("Mi-Panel/")).toBe("/mi-panel");
    expect(normalizeAdminPath("/noticias")).toBe("/gestion-centro");
    expect(normalizeAdminPath("/panel-interno")).toBe("/gestion-centro");
    expect(normalizeAdminPath(undefined)).toBe("/gestion-centro");
  });
});
