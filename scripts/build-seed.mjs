/**
 * Genera supabase/seed.sql con contenido de DEMOSTRACIÓN claramente
 * identificable. No contiene datos reales de ninguna residencia.
 *
 * Uso: node scripts/build-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PRESET_THEMES } from "../src/features/theme/presets.ts";

const out = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));
const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `${q(JSON.stringify(v))}::jsonb`;

// Identificadores estables (uuid v4 válidos) para poder referenciarlos.
const M = {
  jardin: "6f1c2a3e-1b2c-4d3e-8f40-000000000001",
  fachada: "6f1c2a3e-1b2c-4d3e-8f40-000000000002",
  habitacion: "6f1c2a3e-1b2c-4d3e-8f40-000000000003",
  salon: "6f1c2a3e-1b2c-4d3e-8f40-000000000004",
  comedor: "6f1c2a3e-1b2c-4d3e-8f40-000000000005",
  terraza: "6f1c2a3e-1b2c-4d3e-8f40-000000000006",
  actividad: "6f1c2a3e-1b2c-4d3e-8f40-000000000007",
  fisioterapia: "6f1c2a3e-1b2c-4d3e-8f40-000000000008",
  cocina: "6f1c2a3e-1b2c-4d3e-8f40-000000000009",
  biblioteca: "6f1c2a3e-1b2c-4d3e-8f40-00000000000a",
};

const mediaRows = [
  ["jardin", "Jardín", "Ilustración de demostración: jardín con bancos y árboles"],
  ["fachada", "Fachada", "Ilustración de demostración: fachada de un edificio rodeado de árboles"],
  ["habitacion", "Habitación", "Ilustración de demostración: habitación luminosa con cama y ventana"],
  ["salon", "Salón", "Ilustración de demostración: salón con sofá y ventanales"],
  ["comedor", "Comedor", "Ilustración de demostración: comedor con mesas preparadas"],
  ["terraza", "Terraza", "Ilustración de demostración: terraza al atardecer con plantas"],
  ["actividad", "Taller de actividades", "Ilustración de demostración: mesa de taller con pinturas y manualidades"],
  ["fisioterapia", "Sala de fisioterapia", "Ilustración de demostración: sala de ejercicio con barras y pelota"],
  ["cocina", "Alimentación", "Ilustración de demostración: platos con comida casera"],
  ["biblioteca", "Biblioteca", "Ilustración de demostración: rincón de lectura con estanterías"],
];

const sql = [];
sql.push(`-- =============================================================================
-- DATOS DE DEMOSTRACIÓN (generado por scripts/build-seed.mjs)
-- Todo el contenido es ficticio y debe sustituirse desde el panel.
-- =============================================================================
begin;
`);

/* Configuración ------------------------------------------------------------ */
sql.push(`insert into public.site_settings (id, site_name, tagline, phone, email, address_line, postal_code, city, province,
  map_url, opening_hours, social_links, seo_title, seo_description, contact_form_enabled, testimonials_enabled,
  contact_privacy_note, show_demo_notice)
values (1, 'Residencia la Luz', 'Un hogar tranquilo donde cada persona se siente cuidada y acompañada. (Texto de demostración)',
  '+34 900 000 000', 'contacto@example.com', 'Calle de Ejemplo, 1', '00000', 'Ciudad de ejemplo', 'Provincia',
  'https://www.openstreetmap.org', ${j([
    { label: "Lunes a viernes", hours: "9:00 – 19:00 (horario de ejemplo)" },
    { label: "Sábados", hours: "10:00 – 14:00 (horario de ejemplo)" },
  ])}, '[]'::jsonb,
  'Residencia la Luz · Residencia de mayores', 'Web de demostración de una residencia de personas mayores. Sustituye este texto por la descripción real del centro.',
  true, false,
  'Responsable: [pendiente de completar]. Finalidad: responder a tu consulta. Puedes ejercer tus derechos escribiendo al correo del centro. Texto provisional pendiente de revisión jurídica.',
  true)
on conflict (id) do nothing;
`);

/* Temas --------------------------------------------------------------------- */
PRESET_THEMES.forEach((t, i) => {
  sql.push(`insert into public.themes (name, is_preset, tokens, original_tokens, is_active)
values (${q(t.name)}, true, ${j(t.tokens)}, ${j(t.tokens)}, ${i === 0 ? "true" : "false"});`);
});

/* Medios -------------------------------------------------------------------- */
for (const [key, title, alt] of mediaRows) {
  sql.push(`insert into public.media (id, storage_path, file_name, title, alt_text, description, mime_type, size_bytes, width, height, tags, is_demo)
values ('${M[key]}', 'demo/${key}.svg', '${key}.svg', ${q(title)}, ${q(alt)}, 'Imagen de demostración. Sustitúyela por una fotografía real.', 'image/svg+xml', 4096, 1600, 1000, '{demo}', true);`);
}

/* Galería ------------------------------------------------------------------- */
sql.push(`
insert into public.gallery_categories (id, name, slug, sort_order) values
  ('7a2b3c4d-1111-4aaa-8bbb-000000000001', 'Exteriores', 'exteriores', 1),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000002', 'Zonas comunes', 'zonas-comunes', 2),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000003', 'Habitaciones', 'habitaciones', 3),
  ('7a2b3c4d-1111-4aaa-8bbb-000000000004', 'Actividades', 'actividades', 4);
`);
const galleryItems = [
  ["fachada", 1, "Entrada principal"],
  ["jardin", 1, "Jardín"],
  ["terraza", 1, "Terraza"],
  ["salon", 2, "Salón"],
  ["comedor", 2, "Comedor"],
  ["biblioteca", 2, "Rincón de lectura"],
  ["habitacion", 3, "Habitación"],
  ["actividad", 4, "Taller"],
  ["fisioterapia", 4, "Sala de ejercicio"],
];
galleryItems.forEach(([key, cat, caption], i) => {
  sql.push(`insert into public.gallery_items (media_id, category_id, caption, sort_order) values ('${M[key]}', '7a2b3c4d-1111-4aaa-8bbb-00000000000${cat}', ${q(caption)}, ${i});`);
});

/* Servicios ----------------------------------------------------------------- */
const services = [
  ["atencion-personal", "Atención personal", "hand-heart", "habitacion", "Acompañamiento en las actividades de la vida diaria, respetando el ritmo y las preferencias de cada persona."],
  ["actividades", "Actividades y ocio", "music", "actividad", "Talleres, música, lectura y celebraciones para mantener la mente activa y compartir momentos."],
  ["fisioterapia", "Fisioterapia", "activity", "fisioterapia", "Ejercicio adaptado para favorecer la movilidad y el bienestar físico."],
  ["alimentacion", "Alimentación", "utensils", "cocina", "Menús caseros y equilibrados, con atención a las necesidades de cada persona."],
  ["espacios-comunes", "Espacios comunes", "home", "salon", "Salones, jardín y terrazas pensados para la convivencia y la tranquilidad."],
  ["acompanamiento", "Acompañamiento a familias", "users", "jardin", "Comunicación cercana con las familias y apoyo en cada etapa."],
];
services.forEach(([slug, title, icon, media, summary], i) => {
  const html = `<p>${summary}</p><p><strong>Contenido de demostración.</strong> Describe aquí, con datos reales y confirmados, en qué consiste este servicio en vuestro centro. No publiques servicios que no se ofrezcan.</p><h2>¿Qué incluye?</h2><ul><li>Punto de ejemplo 1</li><li>Punto de ejemplo 2</li><li>Punto de ejemplo 3</li></ul>`;
  sql.push(`insert into public.services (title, slug, summary, content_html, icon, media_id, sort_order, status, is_demo)
values (${q(title)}, ${q(slug)}, ${q(summary)}, ${q(html)}, ${q(icon)}, '${M[media]}', ${i}, 'published', true);`);
});

/* Noticias ------------------------------------------------------------------ */
sql.push(`
insert into public.news_categories (id, name, slug, sort_order) values
  ('8b3c4d5e-2222-4bbb-8ccc-000000000001', 'Vida en el centro', 'vida-en-el-centro', 1),
  ('8b3c4d5e-2222-4bbb-8ccc-000000000002', 'Actividades', 'actividades', 2),
  ('8b3c4d5e-2222-4bbb-8ccc-000000000003', 'Avisos', 'avisos', 3);
`);
const news = [
  ["bienvenida-a-nuestra-nueva-web", "Bienvenida a nuestra nueva web", 1, "fachada", "published", "2 days", true, "Estrenamos un espacio para compartir la vida diaria del centro con las familias."],
  ["taller-de-pintura-de-otono", "Taller de pintura de otoño", 2, "actividad", "published", "6 days", false, "Colores cálidos y mucha conversación en el taller de esta semana."],
  ["el-jardin-se-llena-de-flores", "El jardín se llena de flores", 1, "jardin", "published", "12 days", false, "Plantamos nuevas especies aromáticas en el jardín."],
  ["nuevo-horario-de-visitas", "Nuevo horario de visitas (ejemplo)", 3, null, "published", "20 days", false, "Información de ejemplo sobre horarios de visita."],
  ["borrador-menu-de-temporada", "Menú de temporada (borrador)", 1, "cocina", "draft", null, false, "Esta noticia es un borrador: no debe verse en la web pública."],
  ["noticia-programada-de-ejemplo", "Noticia programada de ejemplo", 2, "biblioteca", "published", "-5 days", false, "Programada para dentro de 5 días: no se verá hasta esa fecha."],
];
for (const [slug, title, cat, media, status, ago, featured, excerpt] of news) {
  const html = `<p>${excerpt}</p><p><strong>Texto de demostración.</strong> Sustituye este contenido por una noticia real. Recuerda no publicar fotografías en las que se pueda identificar a residentes sin su autorización expresa.</p><h2>Un subtítulo de ejemplo</h2><p>Puedes usar títulos, listas, enlaces y citas desde el editor de noticias.</p><blockquote>Una cita de ejemplo.</blockquote>`;
  const published =
    ago === null ? "null" : ago.startsWith("-") ? `now() + interval '${ago.slice(1)}'` : `now() - interval '${ago}'`;
  sql.push(`insert into public.news_posts (title, slug, excerpt, content_html, featured_media_id, category_id, author_name, status, published_at, is_featured, is_demo)
values (${q(title)}, ${q(slug)}, ${q(excerpt)}, ${q(html)}, ${media ? `'${M[media]}'` : "null"}, '8b3c4d5e-2222-4bbb-8ccc-00000000000${cat}', 'Equipo del centro', '${status}', ${published}, ${featured}, true);`);
}
sql.push(`insert into public.news_post_media (post_id, media_id, sort_order)
select id, unnest(array['${M.jardin}'::uuid, '${M.terraza}'::uuid, '${M.salon}'::uuid]), generate_series(0, 2)
from public.news_posts where slug = 'bienvenida-a-nuestra-nueva-web';`);

/* Eventos ------------------------------------------------------------------- */
sql.push(`
insert into public.event_categories (id, name, slug, color, sort_order) values
  ('9c4d5e6f-3333-4ccc-8ddd-000000000001', 'Celebraciones', 'celebraciones', '#c08a5b', 1),
  ('9c4d5e6f-3333-4ccc-8ddd-000000000002', 'Talleres', 'talleres', '#5f7d63', 2),
  ('9c4d5e6f-3333-4ccc-8ddd-000000000003', 'Familias', 'familias', '#3f6e8c', 3);
`);
// [slug, título, cat, díasDesdeHoy, horaInicio, horaFin, todoElDía, díasDuración, estado, destacado, media]
const events = [
  ["taller-de-musica", "Taller de música", 2, 2, "17:00", "18:30", false, 0, "published", false, "actividad"],
  ["merienda-con-familias", "Merienda con familias", 3, 5, "17:30", "19:00", false, 0, "published", true, "terraza"],
  ["paseo-por-el-jardin", "Paseo por el jardín", 2, 8, "11:00", "12:00", false, 0, "published", false, "jardin"],
  ["semana-cultural", "Semana cultural", 1, 12, "00:00", "23:59", true, 4, "published", true, "biblioteca"],
  ["cine-de-tarde", "Cine de tarde", 2, 19, "16:30", "18:30", false, 0, "published", false, null],
  ["celebracion-de-cumpleanos", "Celebración de cumpleaños del mes", 1, 26, "17:00", "18:00", false, 0, "published", false, "comedor"],
  ["reunion-informativa", "Reunión informativa para familias", 3, 33, "18:00", "19:00", false, 0, "published", false, "salon"],
  ["evento-borrador", "Evento en borrador (no visible)", 2, 3, "10:00", "11:00", false, 0, "draft", false, null],
];
for (const [slug, title, cat, inDays, start, end, allDay, span, status, featured, media] of events) {
  const day = `(date_trunc('day', now() at time zone 'Europe/Madrid') + interval '${inDays} days')`;
  const startsAt = `(${day} + time '${allDay ? "00:00" : start}') at time zone 'Europe/Madrid'`;
  const endsAt = allDay
    ? `(${day} + interval '${span} days' + time '23:59:59') at time zone 'Europe/Madrid'`
    : `(${day} + time '${end}') at time zone 'Europe/Madrid'`;
  const summary = `Evento de demostración: ${title.toLowerCase()}.`;
  const html = `<p>${summary}</p><p>Describe aquí la actividad: qué se hará, a quién va dirigida y cualquier indicación útil para las familias.</p>`;
  sql.push(`insert into public.events (title, slug, summary, description_html, starts_at, ends_at, all_day, location, media_id, category_id, status, is_featured, is_demo)
values (${q(title)}, ${q(slug)}, ${q(summary)}, ${q(html)}, ${startsAt}, ${endsAt}, ${allDay}, 'Salón principal (ejemplo)', ${media ? `'${M[media]}'` : "null"}, '9c4d5e6f-3333-4ccc-8ddd-00000000000${cat}', '${status}', ${featured}, true);`);
}

/* Testimonios: sin consentimiento => nunca públicos ------------------------- */
sql.push(`insert into public.testimonials (quote, author_label, consent_confirmed, status, sort_order) values
  ('Texto de ejemplo. Publica solo testimonios reales con autorización por escrito.', 'Familiar (ejemplo)', false, 'draft', 1);`);

/* Páginas ------------------------------------------------------------------- */
const cta = (label, href) => ({ label, href });
const style = (o = {}) => ({ align: "left", spacing: "md", background: "default", width: "normal", anchor: "", ...o });
const block = (type, props) => ({ type, props, isHidden: false, visibility: { desktop: true, tablet: true, mobile: true }, schemaVersion: 1 });

const pages = [
  {
    slug: "inicio", title: "Inicio", kind: "home", system: true,
    seo: ["Residencia la Luz · Residencia de mayores", "Un hogar tranquilo y cercano para personas mayores. Contenido de demostración."],
    blocks: [
      block("hero", {
        eyebrow: "Residencia de mayores", title: "Un hogar luminoso donde sentirse cuidado",
        subtitle: "Acompañamos a cada persona con cariño, respeto y profesionalidad, en un entorno tranquilo y acogedor. (Texto de demostración)",
        mediaId: M.jardin, primaryCta: cta("Conocer la residencia", "/conocenos"), secondaryCta: cta("Solicitar información", "/contacto"),
        height: "large", overlay: "gradient", style: style(),
      }),
      block("image-text", {
        eyebrow: "Bienvenidos", title: "Cuidar es también escuchar",
        html: "<p>Presenta aquí la residencia en pocas líneas: quiénes sois, qué os hace diferentes y cómo es el día a día. <strong>Este texto es de demostración</strong> y se edita desde el panel.</p><p>Cuenta vuestra historia con datos reales y comprobados.</p>",
        mediaId: M.fachada, imagePosition: "left", imageRatio: "landscape", cta: cta("Nuestra historia", "/conocenos"), style: style(),
      }),
      block("values", {
        title: "Nuestra forma de cuidar", intro: "Valores de ejemplo: adáptalos a la filosofía real del centro.", columns: 4,
        items: [
          { icon: "heart", title: "Cercanía", text: "Trato cálido y personal en cada momento." },
          { icon: "shield", title: "Seguridad", text: "Espacios adaptados y atención cuidadosa." },
          { icon: "smile", title: "Bienestar", text: "Actividades que dan sentido al día." },
          { icon: "users", title: "Familia", text: "Comunicación constante con las familias." },
        ],
        style: style({ align: "center", background: "soft" }),
      }),
      block("services", { title: "Servicios", intro: "Algunos ejemplos editables. Publica solo los servicios confirmados.", limit: 6, columns: 3, variant: "cards", cta: cta("Ver todos los servicios", "/servicios"), style: style() }),
      block("gallery", { title: "Nuestras instalaciones", intro: "Espacios luminosos pensados para la calma y la convivencia.", source: "gallery", mediaIds: [], limit: 6, columns: 3, cta: cta("Ver la galería completa", "/instalaciones"), style: style({ background: "surface" }) }),
      block("image-text", {
        eyebrow: "Vida diaria", title: "Días con propósito",
        html: "<p>Describe cómo es una jornada: talleres, paseos, música, lectura o celebraciones. <em>Contenido de demostración.</em></p>",
        mediaId: M.actividad, imagePosition: "right", imageRatio: "landscape", cta: cta("Ver próximos eventos", "/eventos"), style: style(),
      }),
      block("events", { title: "Próximos eventos", intro: "", limit: 3, cta: cta("Ver calendario", "/eventos"), style: style({ background: "soft" }) }),
      block("news", { title: "Actualidad", intro: "", limit: 3, onlyFeatured: false, cta: cta("Todas las noticias", "/noticias"), style: style() }),
      block("testimonials", { title: "Lo que dicen las familias", limit: 3, style: style() }),
      block("cta", { title: "¿Quieres visitarnos?", text: "Te enseñamos el centro y resolvemos tus dudas sin compromiso.", primaryCta: cta("Solicitar información", "/contacto"), secondaryCta: cta("Llamar", "tel:+34900000000"), variant: "primary", mediaId: null, style: style({ align: "center" }) }),
    ],
  },
  {
    slug: "conocenos", title: "Conócenos", kind: "blocks", system: true,
    seo: ["Conócenos", "Historia, misión y valores de la residencia (contenido de demostración)."],
    blocks: [
      block("hero-split", { eyebrow: "Conócenos", title: "Una casa con historia y con alma", subtitle: "Texto de demostración para presentar la residencia. Sustitúyelo por la historia real del centro.", mediaId: M.fachada, imagePosition: "right", primaryCta: cta("Visítanos", "/contacto"), secondaryCta: null, style: style() }),
      block("rich-text", { title: "Nuestra historia", html: "<p>Cuenta aquí cómo nació la residencia, su trayectoria y las personas que la hacen posible. <strong>No inventes datos</strong>: utiliza información verificada.</p>", style: style({ width: "narrow" }) }),
      block("values", { title: "Misión y valores", intro: "", columns: 3, items: [
        { icon: "hand-heart", title: "Misión", text: "Texto de ejemplo sobre la misión del centro." },
        { icon: "sun", title: "Visión", text: "Texto de ejemplo sobre la visión del centro." },
        { icon: "leaf", title: "Valores", text: "Texto de ejemplo sobre los valores." },
      ], style: style({ background: "soft" }) }),
      block("image-text", { eyebrow: "Filosofía de atención", title: "La persona, en el centro", html: "<p>Explica el modelo de atención del centro. Contenido de demostración.</p>", mediaId: M.salon, imagePosition: "left", imageRatio: "landscape", cta: null, style: style() }),
      block("team", { title: "Equipo profesional", intro: "Solo se muestran personas que hayan autorizado su aparición.", members: [], style: style() }),
      block("gallery", { title: "Fotografías", intro: "", source: "manual", mediaIds: [M.jardin, M.biblioteca, M.terraza], limit: 6, columns: 3, cta: null, style: style() }),
    ],
  },
  { slug: "servicios", title: "Servicios", kind: "services", system: true, seo: ["Servicios", "Servicios de la residencia (contenido de demostración)."], blocks: [
    block("hero-split", { eyebrow: "Qué ofrecemos", title: "Servicios pensados para cada persona", subtitle: "Ejemplos editables. Publica únicamente los servicios confirmados por el centro.", mediaId: M.salon, imagePosition: "right", primaryCta: null, secondaryCta: null, style: style({ spacing: "md" }) }),
  ] },
  { slug: "instalaciones", title: "Instalaciones", kind: "gallery", system: true, seo: ["Instalaciones", "Galería de las instalaciones (imágenes de demostración)."], blocks: [
    block("hero", { eyebrow: "Instalaciones", title: "Espacios para vivir con calma", subtitle: "Imágenes de demostración: sustitúyelas por fotografías reales de las instalaciones.", mediaId: M.terraza, primaryCta: null, secondaryCta: null, height: "medium", overlay: "gradient", style: style() }),
  ] },
  { slug: "noticias", title: "Noticias", kind: "news", system: true, seo: ["Noticias y actualidad", "Novedades de la residencia."], blocks: [] },
  { slug: "eventos", title: "Eventos", kind: "events", system: true, seo: ["Eventos y calendario", "Agenda de actividades de la residencia."], blocks: [] },
  { slug: "contacto", title: "Contacto", kind: "contact", system: true, seo: ["Contacto", "Datos de contacto y formulario."], blocks: [] },
  ...[
    ["aviso-legal", "Aviso legal", "<h2>Datos del titular</h2><p>[Razón social, NIF, domicilio, datos registrales y de contacto: <strong>pendiente de completar</strong>.]</p><h2>Condiciones de uso</h2><p>[Texto pendiente de redacción y revisión por un profesional.]</p>"],
    ["privacidad", "Política de privacidad", "<h2>Responsable del tratamiento</h2><p>[Pendiente de completar.]</p><h2>Datos que tratamos</h2><p>A través del formulario de contacto se recogen nombre, correo electrónico, teléfono (opcional) y el mensaje, únicamente para responder a la consulta.</p><h2>Base legal, conservación y derechos</h2><p>[Pendiente de completar y revisar por un profesional: base de legitimación, plazos de conservación, destinatarios y ejercicio de derechos ante la AEPD.]</p>"],
    ["cookies", "Política de cookies", "<p>Esta web, tal como se entrega, no instala cookies de analítica ni publicidad. Usa cookies técnicas solo en el área de administración (inicio de sesión) y en la vista previa.</p><p>Los vídeos incrustados solo se cargan cuando la persona usuaria pulsa reproducir. <strong>Revisa este texto</strong> si añades herramientas de terceros.</p>"],
  ].map(([slug, title, html]) => ({
    slug, title, kind: "legal", system: true, seo: [title, null],
    blocks: [block("rich-text", { title: "", html, style: style({ width: "narrow" }) })],
  })),
];

for (const p of pages) {
  sql.push(`
-- Página: ${p.slug}
with pg as (
  insert into public.pages (slug, title, is_system, kind, status, seo_title, seo_description)
  values (${q(p.slug)}, ${q(p.title)}, ${p.system}, ${q(p.kind)}, 'published', ${q(p.seo[0])}, ${q(p.seo[1])})
  returning id
), rev as (
  insert into public.page_revisions (page_id, version, schema_version, note)
  select id, 1, 1, 'Contenido inicial de demostración' from pg
  returning id, page_id
), blocks(position, type, props) as (
  values ${p.blocks.length ? p.blocks.map((b, i) => `(${i}, ${q(b.type)}, ${j(b.props)})`).join(",\n         ") : "(0, null::text, null::jsonb)"}
), ins_rev as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, rev.id, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
), ins_draft as (
  insert into public.page_blocks (page_id, revision_id, position, type, props)
  select rev.page_id, null, blocks.position, blocks.type, blocks.props from rev, blocks where blocks.type is not null
)
select count(*) from rev;`);
}

sql.push(`
-- Las sentencias WITH no ven sus propias inserciones: se enlaza la revisión publicada aquí.
update public.pages p set published_revision_id = r.id
from public.page_revisions r where r.page_id = p.id and r.version = 1;`);

/* Menús --------------------------------------------------------------------- */
const header = [
  ["Inicio", "/", "inicio"], ["Conócenos", "/conocenos", "conocenos"], ["Servicios", "/servicios", "servicios"],
  ["Instalaciones", "/instalaciones", "instalaciones"], ["Noticias", "/noticias", "noticias"],
  ["Eventos", "/eventos", "eventos"], ["Contacto", "/contacto", "contacto"],
];
header.forEach(([label, href, slug], i) => {
  sql.push(`insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'header', ${q(label)}, ${q(href)}, id, ${i}, true from public.pages where slug = ${q(slug)};`);
  if (slug !== "inicio") sql.push(`insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'footer', ${q(label)}, ${q(href)}, id, ${i}, true from public.pages where slug = ${q(slug)};`);
});
[["Aviso legal", "/aviso-legal", "aviso-legal"], ["Privacidad", "/privacidad", "privacidad"], ["Cookies", "/cookies", "cookies"]].forEach(([label, href, slug], i) => {
  sql.push(`insert into public.menu_items (location, label, href, page_id, sort_order, is_system) select 'legal', ${q(label)}, ${q(href)}, id, ${i}, true from public.pages where slug = ${q(slug)};`);
});

// El registro de acciones no debe incluir la carga inicial.
sql.push(`
delete from public.audit_log;
commit;
`);

writeFileSync(out, sql.join("\n"));
console.log("seed.sql generado:", out);
