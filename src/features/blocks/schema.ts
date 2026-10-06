import { z } from "zod";

/**
 * Formato de bloques de página · versión 1.
 *
 * Cada bloque es { type, props, isHidden, visibility, schemaVersion }.
 * Los bloques NO contienen código: solo datos validados que la aplicación
 * renderiza con componentes propios. El HTML de los bloques de texto se
 * sanea en servidor antes de guardarse.
 */
export const BLOCKS_SCHEMA_VERSION = 1;

const uuid = z.uuid();
const optionalMediaId = uuid.nullable().default(null);
const shortText = (max: number) => z.string().max(max).default("");

/** Enlace interno (/ruta), externo https, teléfono o correo. */
export const hrefSchema = z
  .string()
  .max(300)
  .regex(/^(\/[a-z0-9\-/#?=&]*|https:\/\/[^\s"'<>]+|tel:[+\d\s]+|mailto:[^\s"'<>]+|#[a-z0-9-]+)$/i, "Enlace no válido");

const ctaSchema = z.object({
  label: z.string().max(40),
  href: hrefSchema,
});
const optionalCta = ctaSchema.nullable().default(null);

/** Ajustes comunes de presentación de cualquier bloque. */
export const blockStyleSchema = z
  .object({
    align: z.enum(["left", "center"]).default("left"),
    spacing: z.enum(["none", "sm", "md", "lg"]).default("md"),
    background: z.enum(["default", "soft", "surface", "primary"]).default("default"),
    width: z.enum(["narrow", "normal", "wide", "full"]).default("normal"),
    anchor: z
      .string()
      .regex(/^[a-z0-9-]{0,40}$/)
      .default(""),
  })
  .default({ align: "left", spacing: "md", background: "default", width: "normal", anchor: "" });

export const VALUE_ICONS = [
  "heart", "home", "users", "leaf", "sun", "shield", "hand-heart", "smile",
  "utensils", "activity", "music", "book", "flower", "coffee", "stethoscope",
  "accessibility", "calendar", "sparkles", "trees", "bed",
] as const;
export const iconSchema = z.enum(VALUE_ICONS);

export const blockPropsSchemas = {
  hero: z.object({
    eyebrow: shortText(80),
    title: z.string().min(1).max(140),
    subtitle: shortText(400),
    mediaId: optionalMediaId,
    primaryCta: optionalCta,
    secondaryCta: optionalCta,
    height: z.enum(["medium", "large", "screen"]).default("large"),
    overlay: z.enum(["soft", "strong", "gradient"]).default("gradient"),
    style: blockStyleSchema,
  }),
  "hero-split": z.object({
    eyebrow: shortText(80),
    title: z.string().min(1).max(140),
    subtitle: shortText(500),
    mediaId: optionalMediaId,
    imagePosition: z.enum(["left", "right"]).default("right"),
    primaryCta: optionalCta,
    secondaryCta: optionalCta,
    style: blockStyleSchema,
  }),
  "rich-text": z.object({
    title: shortText(140),
    html: z.string().max(40000).default(""),
    style: blockStyleSchema,
  }),
  "image-text": z.object({
    eyebrow: shortText(80),
    title: shortText(140),
    html: z.string().max(20000).default(""),
    mediaId: optionalMediaId,
    imagePosition: z.enum(["left", "right"]).default("left"),
    imageRatio: z.enum(["square", "portrait", "landscape"]).default("landscape"),
    cta: optionalCta,
    style: blockStyleSchema,
  }),
  gallery: z.object({
    title: shortText(140),
    intro: shortText(400),
    source: z.enum(["manual", "gallery"]).default("manual"),
    mediaIds: z.array(uuid).max(24).default([]),
    limit: z.number().int().min(2).max(24).default(8),
    columns: z.number().int().min(2).max(4).default(3),
    cta: optionalCta,
    style: blockStyleSchema,
  }),
  services: z.object({
    title: shortText(140),
    intro: shortText(400),
    limit: z.number().int().min(1).max(24).default(6),
    columns: z.number().int().min(2).max(4).default(3),
    variant: z.enum(["cards", "list"]).default("cards"),
    cta: optionalCta,
    style: blockStyleSchema,
  }),
  news: z.object({
    title: shortText(140),
    intro: shortText(400),
    limit: z.number().int().min(1).max(12).default(3),
    onlyFeatured: z.boolean().default(false),
    cta: optionalCta,
    style: blockStyleSchema,
  }),
  events: z.object({
    title: shortText(140),
    intro: shortText(400),
    limit: z.number().int().min(1).max(12).default(3),
    cta: optionalCta,
    style: blockStyleSchema,
  }),
  values: z.object({
    title: shortText(140),
    intro: shortText(400),
    columns: z.number().int().min(2).max(4).default(3),
    items: z
      .array(
        z.object({
          icon: iconSchema.default("heart"),
          title: z.string().min(1).max(80),
          text: shortText(400),
        }),
      )
      .max(12)
      .default([]),
    style: blockStyleSchema,
  }),
  testimonials: z.object({
    title: shortText(140),
    limit: z.number().int().min(1).max(9).default(3),
    style: blockStyleSchema,
  }),
  team: z.object({
    title: shortText(140),
    intro: shortText(400),
    members: z
      .array(
        z.object({
          name: z.string().min(1).max(100),
          role: shortText(100),
          mediaId: optionalMediaId,
          // Solo se muestran miembros con autorización registrada.
          consent: z.boolean().default(false),
        }),
      )
      .max(30)
      .default([]),
    style: blockStyleSchema,
  }),
  cta: z.object({
    title: z.string().min(1).max(140),
    text: shortText(400),
    primaryCta: optionalCta,
    secondaryCta: optionalCta,
    variant: z.enum(["primary", "soft", "image"]).default("primary"),
    mediaId: optionalMediaId,
    style: blockStyleSchema,
  }),
  "contact-info": z.object({
    title: shortText(140),
    intro: shortText(400),
    showHours: z.boolean().default(true),
    showMap: z.boolean().default(true),
    showForm: z.boolean().default(false),
    style: blockStyleSchema,
  }),
  spacer: z.object({
    size: z.enum(["sm", "md", "lg", "xl"]).default("md"),
    divider: z.boolean().default(false),
    style: blockStyleSchema,
  }),
  video: z.object({
    title: shortText(140),
    provider: z.enum(["youtube", "vimeo"]).default("youtube"),
    // Solo el identificador: nunca una URL ni código de inserción.
    videoId: z.string().regex(/^([A-Za-z0-9_-]{6,20})?$/, "Identificador de vídeo no válido").default(""),
    caption: shortText(200),
    style: blockStyleSchema,
  }),
} as const;

export type BlockType = keyof typeof blockPropsSchemas;
export const BLOCK_TYPES = Object.keys(blockPropsSchemas) as BlockType[];

export type BlockPropsMap = { [K in BlockType]: z.infer<(typeof blockPropsSchemas)[K]> };

export const visibilitySchema = z
  .object({ desktop: z.boolean(), tablet: z.boolean(), mobile: z.boolean() })
  .default({ desktop: true, tablet: true, mobile: true });

export type BlockVisibility = z.infer<typeof visibilitySchema>;

export type Block<K extends BlockType = BlockType> = {
  /** Identificador local estable (para arrastrar y soltar en el editor). */
  key: string;
  type: K;
  props: BlockPropsMap[K];
  isHidden: boolean;
  visibility: BlockVisibility;
  schemaVersion: number;
};

export type AnyBlock = { [K in BlockType]: Block<K> }[BlockType];

const blockEnvelopeSchema = z.object({
  key: z.string().max(64).optional(),
  type: z.enum(BLOCK_TYPES as [BlockType, ...BlockType[]]),
  props: z.unknown(),
  isHidden: z.boolean().default(false),
  visibility: visibilitySchema,
  schemaVersion: z.number().int().default(BLOCKS_SCHEMA_VERSION),
});

export type BlockParseResult =
  | { ok: true; blocks: AnyBlock[] }
  | { ok: false; errors: { index: number; message: string }[] };

let keyCounter = 0;
export function newBlockKey(): string {
  keyCounter += 1;
  return `b${Date.now().toString(36)}${keyCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Valida un bloque concreto. */
export function parseBlock(input: unknown): { ok: true; block: AnyBlock } | { ok: false; message: string } {
  const env = blockEnvelopeSchema.safeParse(input);
  if (!env.success) return { ok: false, message: "Tipo de bloque no válido" };
  if (env.data.schemaVersion > BLOCKS_SCHEMA_VERSION) {
    return { ok: false, message: "Versión de bloque no soportada" };
  }
  const schema = blockPropsSchemas[env.data.type];
  const props = schema.safeParse(env.data.props ?? {});
  if (!props.success) {
    const first = props.error.issues[0];
    return { ok: false, message: `${first.path.join(".") || "props"}: ${first.message}` };
  }
  return {
    ok: true,
    block: {
      key: env.data.key ?? newBlockKey(),
      type: env.data.type,
      props: props.data,
      isHidden: env.data.isHidden,
      visibility: env.data.visibility,
      schemaVersion: BLOCKS_SCHEMA_VERSION,
    } as AnyBlock,
  };
}

/** Valida una lista completa de bloques. */
export function parseBlocks(input: unknown): BlockParseResult {
  if (!Array.isArray(input)) return { ok: false, errors: [{ index: -1, message: "Se esperaba una lista" }] };
  if (input.length > 60) return { ok: false, errors: [{ index: -1, message: "Máximo 60 bloques por página" }] };
  const blocks: AnyBlock[] = [];
  const errors: { index: number; message: string }[] = [];
  input.forEach((raw, index) => {
    const r = parseBlock(raw);
    if (r.ok) blocks.push(r.block);
    else errors.push({ index, message: r.message });
  });
  return errors.length ? { ok: false, errors } : { ok: true, blocks };
}

/** Bloques almacenados (filas de page_blocks) -> bloques válidos. Descarta los corruptos. */
export function blocksFromRows(
  rows: { id: string; type: string; props: unknown; is_hidden: boolean; visibility: unknown; schema_version: number }[],
): AnyBlock[] {
  const out: AnyBlock[] = [];
  for (const row of rows) {
    const r = parseBlock({
      key: row.id,
      type: row.type,
      props: row.props,
      isHidden: row.is_hidden,
      visibility: row.visibility ?? undefined,
      schemaVersion: row.schema_version,
    });
    if (r.ok) out.push(r.block);
  }
  return out;
}

/** Recoge todos los identificadores de imágenes referenciados por los bloques. */
export function collectBlockMediaIds(blocks: AnyBlock[]): string[] {
  const ids = new Set<string>();
  for (const b of blocks) {
    const p = b.props as Record<string, unknown>;
    if (typeof p.mediaId === "string") ids.add(p.mediaId);
    if (Array.isArray(p.mediaIds)) for (const id of p.mediaIds) if (typeof id === "string") ids.add(id);
    if (b.type === "team") for (const m of (b.props as BlockPropsMap["team"]).members) if (m.mediaId) ids.add(m.mediaId);
  }
  return [...ids];
}

/** Valores por defecto de un bloque nuevo (para el botón "Añadir bloque"). */
export function defaultBlock(type: BlockType): AnyBlock {
  const defaults: { [K in BlockType]: unknown } = {
    hero: { title: "Un titular para la portada", subtitle: "Texto de apoyo editable.", primaryCta: { label: "Solicitar información", href: "/contacto" } },
    "hero-split": { title: "Título de la sección", subtitle: "Texto de apoyo editable." },
    "rich-text": { title: "", html: "<p>Escribe aquí el contenido.</p>" },
    "image-text": { title: "Título", html: "<p>Describe esta sección.</p>" },
    gallery: { title: "Galería", source: "gallery", limit: 6 },
    services: { title: "Nuestros servicios", limit: 6 },
    news: { title: "Actualidad", limit: 3, cta: { label: "Ver todas las noticias", href: "/noticias" } },
    events: { title: "Próximos eventos", limit: 3, cta: { label: "Ver calendario", href: "/eventos" } },
    values: { title: "Nuestros valores", items: [{ icon: "heart", title: "Valor", text: "Descripción breve." }] },
    testimonials: { title: "Lo que dicen las familias" },
    team: { title: "Equipo", members: [] },
    cta: { title: "¿Quieres conocernos?", text: "Te atenderemos sin compromiso.", primaryCta: { label: "Contactar", href: "/contacto" } },
    "contact-info": { title: "Contacto" },
    spacer: { size: "md" },
    video: { title: "", provider: "youtube", videoId: "" },
  };
  const r = parseBlock({ type, props: defaults[type] });
  if (!r.ok) throw new Error(`Bloque por defecto no válido: ${type} (${r.message})`);
  return r.block;
}

export const BLOCK_LABELS: Record<BlockType, { label: string; description: string }> = {
  hero: { label: "Portada con imagen", description: "Imagen a pantalla completa con titular y botones." },
  "hero-split": { label: "Portada imagen + texto", description: "Titular a un lado e imagen al otro." },
  "rich-text": { label: "Texto enriquecido", description: "Párrafos, títulos, listas y enlaces." },
  "image-text": { label: "Imagen con texto", description: "Imagen lateral y texto descriptivo." },
  gallery: { label: "Galería", description: "Cuadrícula de fotografías con ampliación." },
  services: { label: "Tarjetas de servicios", description: "Servicios publicados." },
  news: { label: "Noticias recientes", description: "Últimas noticias publicadas." },
  events: { label: "Próximos eventos", description: "Agenda de los próximos eventos." },
  values: { label: "Valores del centro", description: "Iconos con título y texto." },
  testimonials: { label: "Testimonios", description: "Solo testimonios autorizados." },
  team: { label: "Equipo", description: "Solo personas con autorización." },
  cta: { label: "Llamada a la acción", description: "Mensaje destacado con botones." },
  "contact-info": { label: "Información de contacto", description: "Dirección, teléfono, horario y mapa." },
  spacer: { label: "Separador / espacio", description: "Espacio en blanco o línea divisoria." },
  video: { label: "Vídeo", description: "YouTube/Vimeo con carga diferida y sin cookies previas." },
};
