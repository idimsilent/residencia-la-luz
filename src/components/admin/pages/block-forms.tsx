"use client";

import { useId, type ReactNode } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { AnyBlock, BlockPropsMap, BlockVisibility } from "@/features/blocks/schema";
import { VALUE_ICONS } from "@/features/blocks/schema";
import type { MediaLite } from "@/features/media/url";
import { Icon, ICONS } from "@/components/public/icon";
import { RichTextEditor } from "../rich-text-editor";
import { MediaField, MediaListField } from "../media-picker";
import { Button, Field, Input, Select, Switch, Textarea } from "../ui";
import { cn } from "@/lib/utils";

type MediaMap = Record<string, MediaLite>;
type Cta = { label: string; href: string } | null;
type Style = BlockPropsMap["hero"]["style"];

/* ------------------------------------------------------------ Campos ---- */

function Text({ label, value, onChange, max, hint, multiline, required }: { label: string; value: string; onChange: (v: string) => void; max: number; hint?: string; multiline?: boolean; required?: boolean }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint ?? (value.length > max * 0.8 ? `${value.length}/${max}` : undefined)} required={required}>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={3} />
      ) : (
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} />
      )}
    </Field>
  );
}

function Choice<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: Record<T, string> }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {(Object.keys(options) as T[]).map((k) => (
          <option key={k} value={k}>
            {options[k]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function NumberF({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={`Entre ${min} y ${max}`}>
      <Input id={id} type="number" min={min} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} />
    </Field>
  );
}

function CtaF({ label, value, onChange }: { label: string; value: Cta; onChange: (v: Cta) => void }) {
  const id = useId();
  const enabled = Boolean(value);
  const validHref = !value || /^(\/[a-z0-9\-/#?=&]*|https:\/\/[^\s"'<>]+|tel:[+\d\s]+|mailto:[^\s"'<>]+|#[a-z0-9-]+)$/i.test(value.href);
  return (
    <fieldset className="rounded-xl border border-stone-200 p-3">
      <legend className="px-1 text-sm font-bold text-stone-800">{label}</legend>
      <Switch checked={enabled} onChange={(on) => onChange(on ? { label: "Más información", href: "/contacto" } : null)} label="Mostrar botón" />
      {value ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Texto" htmlFor={`${id}-l`}>
            <Input id={`${id}-l`} value={value.label} maxLength={40} onChange={(e) => onChange({ ...value, label: e.target.value })} />
          </Field>
          <Field label="Enlace" htmlFor={`${id}-h`} hint="/contacto, https://…, tel:…" error={validHref ? undefined : "Enlace no válido"}>
            <Input id={`${id}-h`} value={value.href} maxLength={300} onChange={(e) => onChange({ ...value, href: e.target.value.trim() })} />
          </Field>
        </div>
      ) : null}
    </fieldset>
  );
}

function MediaF({ label, value, media, onChange, onMedia }: { label: string; value: string | null; media: MediaMap; onChange: (id: string | null) => void; onMedia: (m: MediaLite) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-bold text-stone-800">{label}</p>
      <MediaField
        value={value ? media[value] ?? null : null}
        label={label}
        onChange={(m) => {
          if (m) onMedia(m);
          onChange(m?.id ?? null);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------- Formulario por tipo ---- */

export function BlockForm({ block, onChange, media, onMedia }: { block: AnyBlock; onChange: (b: AnyBlock) => void; media: MediaMap; onMedia: (m: MediaLite) => void }) {
  // Actualiza una propiedad del bloque de forma tipada.
  const set = (patch: Record<string, unknown>) => onChange({ ...block, props: { ...block.props, ...patch } } as AnyBlock);
  const p = block.props as Record<string, unknown>;
  const mediaProps = { media, onMedia };

  const fields: ReactNode = (() => {
    switch (block.type) {
      case "hero":
      case "hero-split": {
        const b = block.props as BlockPropsMap["hero-split"] & Partial<BlockPropsMap["hero"]>;
        return (
          <>
            <Text label="Antetítulo" value={b.eyebrow} onChange={(v) => set({ eyebrow: v })} max={80} hint="Texto pequeño sobre el titular (opcional)." />
            <Text label="Titular" value={b.title} onChange={(v) => set({ title: v })} max={140} required />
            <Text label="Texto" value={b.subtitle} onChange={(v) => set({ subtitle: v })} max={block.type === "hero" ? 400 : 500} multiline />
            <MediaF label="Imagen" value={b.mediaId} onChange={(id) => set({ mediaId: id })} {...mediaProps} />
            {block.type === "hero" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice label="Altura" value={block.props.height} onChange={(v) => set({ height: v })} options={{ medium: "Media", large: "Grande", screen: "Pantalla completa" }} />
                <Choice label="Oscurecer imagen" value={block.props.overlay} onChange={(v) => set({ overlay: v })} options={{ soft: "Suave", strong: "Intenso", gradient: "Degradado" }} />
              </div>
            ) : (
              <Choice label="Posición de la imagen" value={(block.props as BlockPropsMap["hero-split"]).imagePosition} onChange={(v) => set({ imagePosition: v })} options={{ left: "Izquierda", right: "Derecha" }} />
            )}
            <CtaF label="Botón principal" value={b.primaryCta} onChange={(v) => set({ primaryCta: v })} />
            <CtaF label="Botón secundario" value={b.secondaryCta} onChange={(v) => set({ secondaryCta: v })} />
          </>
        );
      }
      case "rich-text":
        return (
          <>
            <Text label="Título (opcional)" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Field label="Contenido">
              <RichTextEditor value={block.props.html} onChange={(html) => set({ html })} ariaLabel="Contenido del bloque" />
            </Field>
          </>
        );
      case "image-text":
        return (
          <>
            <Text label="Antetítulo" value={block.props.eyebrow} onChange={(v) => set({ eyebrow: v })} max={80} />
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Field label="Texto">
              <RichTextEditor value={block.props.html} onChange={(html) => set({ html })} allowImages={false} ariaLabel="Texto del bloque" />
            </Field>
            <MediaF label="Imagen" value={block.props.mediaId} onChange={(id) => set({ mediaId: id })} {...mediaProps} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Choice label="Posición de la imagen" value={block.props.imagePosition} onChange={(v) => set({ imagePosition: v })} options={{ left: "Izquierda", right: "Derecha" }} />
              <Choice label="Formato de la imagen" value={block.props.imageRatio} onChange={(v) => set({ imageRatio: v })} options={{ landscape: "Horizontal", square: "Cuadrada", portrait: "Vertical" }} />
            </div>
            <CtaF label="Botón" value={block.props.cta} onChange={(v) => set({ cta: v })} />
          </>
        );
      case "gallery":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <Choice label="Fotografías" value={block.props.source} onChange={(v) => set({ source: v })} options={{ gallery: "Las de la galería de instalaciones", manual: "Elegidas a mano" }} />
            {block.props.source === "manual" ? (
              <div>
                <p className="mb-1.5 text-sm font-bold text-stone-800">Imágenes</p>
                <MediaListField
                  value={block.props.mediaIds.map((id) => media[id]).filter((m): m is MediaLite => Boolean(m))}
                  onChange={(list) => {
                    list.forEach(onMedia);
                    set({ mediaIds: list.map((m) => m.id) });
                  }}
                />
              </div>
            ) : (
              <NumberF label="Número de fotos" value={block.props.limit} onChange={(v) => set({ limit: v })} min={2} max={24} />
            )}
            <NumberF label="Columnas" value={block.props.columns} onChange={(v) => set({ columns: v })} min={2} max={4} />
            <CtaF label="Botón" value={block.props.cta} onChange={(v) => set({ cta: v })} />
          </>
        );
      case "services":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberF label="Cuántos" value={block.props.limit} onChange={(v) => set({ limit: v })} min={1} max={24} />
              <NumberF label="Columnas" value={block.props.columns} onChange={(v) => set({ columns: v })} min={2} max={4} />
              <Choice label="Diseño" value={block.props.variant} onChange={(v) => set({ variant: v })} options={{ cards: "Tarjetas", list: "Lista" }} />
            </div>
            <p className="text-xs text-stone-500">Los servicios se gestionan en la sección «Servicios».</p>
            <CtaF label="Botón" value={block.props.cta} onChange={(v) => set({ cta: v })} />
          </>
        );
      case "news":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <NumberF label="Número de noticias" value={block.props.limit} onChange={(v) => set({ limit: v })} min={1} max={12} />
            <Switch checked={block.props.onlyFeatured} onChange={(v) => set({ onlyFeatured: v })} label="Solo noticias destacadas" />
            <CtaF label="Botón" value={block.props.cta} onChange={(v) => set({ cta: v })} />
          </>
        );
      case "events":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <NumberF label="Número de eventos" value={block.props.limit} onChange={(v) => set({ limit: v })} min={1} max={12} />
            <CtaF label="Botón" value={block.props.cta} onChange={(v) => set({ cta: v })} />
          </>
        );
      case "values": {
        const items = block.props.items;
        const setItem = (i: number, patch: Partial<(typeof items)[number]>) => set({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
        const move = (i: number, d: number) => {
          const next = [...items];
          const [x] = next.splice(i, 1);
          next.splice(i + d, 0, x);
          set({ items: next });
        };
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <NumberF label="Columnas" value={block.props.columns} onChange={(v) => set({ columns: v })} min={2} max={4} />
            <div className="space-y-3">
              {items.map((it, i) => (
                <fieldset key={i} className="rounded-xl border border-stone-200 p-3">
                  <legend className="px-1 text-sm font-bold text-stone-800">Elemento {i + 1}</legend>
                  <div className="mb-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Icono">
                    {VALUE_ICONS.filter((k) => k in ICONS).map((k) => (
                      <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={it.icon === k}
                        aria-label={ICONS[k]?.label ?? k}
                        onClick={() => setItem(i, { icon: k })}
                        className={cn("rounded-md p-1.5", it.icon === k ? "bg-sage-100 text-sage-800 ring-1 ring-sage-500" : "text-stone-500 hover:bg-stone-100")}
                      >
                        <Icon name={k} className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Text label="Título" value={it.title} onChange={(v) => setItem(i, { title: v })} max={80} required />
                    <Text label="Texto" value={it.text} onChange={(v) => setItem(i, { text: v })} max={400} multiline />
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Bajar">
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-auto text-[#b42318]" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Quitar
                    </Button>
                  </div>
                </fieldset>
              ))}
              {items.length < 12 ? (
                <Button size="sm" variant="secondary" onClick={() => set({ items: [...items, { icon: "heart", title: "Nuevo elemento", text: "" }] })}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Añadir elemento
                </Button>
              ) : null}
            </div>
          </>
        );
      }
      case "testimonials":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <NumberF label="Número de testimonios" value={block.props.limit} onChange={(v) => set({ limit: v })} min={1} max={9} />
            <p className="text-xs text-stone-500">Solo se muestran testimonios publicados con consentimiento registrado (Configuración › Testimonios).</p>
          </>
        );
      case "team": {
        const members = block.props.members;
        const setM = (i: number, patch: Partial<(typeof members)[number]>) => set({ members: members.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
              Publica nombres y fotos del equipo solo con autorización escrita de cada persona. Los miembros sin la casilla de autorización marcada no se muestran en la web.
            </p>
            {members.map((m, i) => (
              <fieldset key={i} className="space-y-2 rounded-xl border border-stone-200 p-3">
                <legend className="px-1 text-sm font-bold text-stone-800">Persona {i + 1}</legend>
                <Text label="Nombre" value={m.name} onChange={(v) => setM(i, { name: v })} max={100} required />
                <Text label="Puesto" value={m.role} onChange={(v) => setM(i, { role: v })} max={100} />
                <MediaF label="Foto" value={m.mediaId} onChange={(id) => setM(i, { mediaId: id })} {...mediaProps} />
                <Switch checked={m.consent} onChange={(v) => setM(i, { consent: v })} label="Tengo su autorización por escrito" />
                <Button size="sm" variant="ghost" className="text-[#b42318]" onClick={() => set({ members: members.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Quitar
                </Button>
              </fieldset>
            ))}
            {members.length < 30 ? (
              <Button size="sm" variant="secondary" onClick={() => set({ members: [...members, { name: "Nombre", role: "", mediaId: null, consent: false }] })}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Añadir persona
              </Button>
            ) : null}
          </>
        );
      }
      case "cta":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} required />
            <Text label="Texto" value={block.props.text} onChange={(v) => set({ text: v })} max={400} multiline />
            <Choice label="Estilo" value={block.props.variant} onChange={(v) => set({ variant: v })} options={{ primary: "Color principal", soft: "Suave", image: "Con imagen de fondo" }} />
            {block.props.variant === "image" ? <MediaF label="Imagen de fondo" value={block.props.mediaId} onChange={(id) => set({ mediaId: id })} {...mediaProps} /> : null}
            <CtaF label="Botón principal" value={block.props.primaryCta} onChange={(v) => set({ primaryCta: v })} />
            <CtaF label="Botón secundario" value={block.props.secondaryCta} onChange={(v) => set({ secondaryCta: v })} />
          </>
        );
      case "contact-info":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Text label="Introducción" value={block.props.intro} onChange={(v) => set({ intro: v })} max={400} multiline />
            <Switch checked={block.props.showHours} onChange={(v) => set({ showHours: v })} label="Mostrar horario" />
            <Switch checked={block.props.showMap} onChange={(v) => set({ showMap: v })} label="Mostrar mapa" />
            <Switch checked={block.props.showForm} onChange={(v) => set({ showForm: v })} label="Mostrar formulario de contacto" />
            <p className="text-xs text-stone-500">Los datos de contacto se editan en «Información del centro».</p>
          </>
        );
      case "spacer":
        return (
          <>
            <Choice label="Tamaño" value={block.props.size} onChange={(v) => set({ size: v })} options={{ sm: "Pequeño", md: "Mediano", lg: "Grande", xl: "Muy grande" }} />
            <Switch checked={block.props.divider} onChange={(v) => set({ divider: v })} label="Mostrar línea divisoria" />
          </>
        );
      case "video":
        return (
          <>
            <Text label="Título" value={block.props.title} onChange={(v) => set({ title: v })} max={140} />
            <Choice label="Plataforma" value={block.props.provider} onChange={(v) => set({ provider: v })} options={{ youtube: "YouTube", vimeo: "Vimeo" }} />
            <VideoIdField provider={block.props.provider} value={block.props.videoId} onChange={(v) => set({ videoId: v })} />
            <Text label="Pie del vídeo" value={block.props.caption} onChange={(v) => set({ caption: v })} max={200} />
            <p className="text-xs text-stone-500">El vídeo no se carga hasta que la persona pulsa «reproducir» (sin cookies previas).</p>
          </>
        );
    }
  })();

  return (
    <div className="space-y-4">
      {fields}
      <StyleForm style={p.style as Style} onChange={(style) => set({ style })} />
      <VisibilityForm value={block.visibility} isHidden={block.isHidden} onChange={(visibility, isHidden) => onChange({ ...block, visibility, isHidden } as AnyBlock)} />
    </div>
  );
}

/** Acepta el enlace completo del vídeo y extrae solo el identificador. */
function VideoIdField({ provider, value, onChange }: { provider: "youtube" | "vimeo"; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const extract = (raw: string) => {
    const s = raw.trim();
    if (provider === "youtube") {
      const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,20})/);
      return m ? m[1] : s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20);
    }
    const m = s.match(/vimeo\.com\/(?:video\/)?(\d{6,12})/);
    return m ? m[1] : s.replace(/[^0-9]/g, "").slice(0, 12);
  };
  const valid = value === "" || /^[A-Za-z0-9_-]{6,20}$/.test(value);
  return (
    <Field label="Enlace o identificador del vídeo" htmlFor={id} hint="Pega el enlace de YouTube o Vimeo: guardamos solo su identificador." error={valid ? undefined : "Identificador no válido"}>
      <Input id={id} value={value} onChange={(e) => onChange(extract(e.target.value))} placeholder="https://www.youtube.com/watch?v=…" />
    </Field>
  );
}

function StyleForm({ style, onChange }: { style: Style; onChange: (s: Style) => void }) {
  const id = useId();
  return (
    <details className="rounded-xl border border-stone-200 p-3">
      <summary className="cursor-pointer text-sm font-bold text-stone-800">Diseño de la sección</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice label="Fondo" value={style.background} onChange={(v) => onChange({ ...style, background: v })} options={{ default: "Sin fondo", soft: "Suave", surface: "Tarjeta", primary: "Color principal" }} />
        <Choice label="Espaciado" value={style.spacing} onChange={(v) => onChange({ ...style, spacing: v })} options={{ none: "Sin espacio", sm: "Pequeño", md: "Normal", lg: "Amplio" }} />
        <Choice label="Ancho" value={style.width} onChange={(v) => onChange({ ...style, width: v })} options={{ narrow: "Estrecho", normal: "Normal", wide: "Ancho", full: "Completo" }} />
        <Choice label="Alineación" value={style.align} onChange={(v) => onChange({ ...style, align: v })} options={{ left: "Izquierda", center: "Centrada" }} />
        <Field label="Ancla (opcional)" htmlFor={`${id}-a`} hint="Para enlazar con /pagina#ancla" className="sm:col-span-2">
          <Input id={`${id}-a`} value={style.anchor} maxLength={40} onChange={(e) => onChange({ ...style, anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
        </Field>
      </div>
    </details>
  );
}

function VisibilityForm({ value, isHidden, onChange }: { value: BlockVisibility; isHidden: boolean; onChange: (v: BlockVisibility, hidden: boolean) => void }) {
  return (
    <details className="rounded-xl border border-stone-200 p-3">
      <summary className="cursor-pointer text-sm font-bold text-stone-800">Visibilidad</summary>
      <div className="mt-3 space-y-3">
        <Switch checked={!isHidden} onChange={(v) => onChange(value, !v)} label="Mostrar este bloque" description="Si lo desactivas, el bloque se conserva pero no aparece en la web." />
        <div className="grid gap-2 sm:grid-cols-3">
          <Switch checked={value.desktop} onChange={(v) => onChange({ ...value, desktop: v }, isHidden)} label="Ordenador" />
          <Switch checked={value.tablet} onChange={(v) => onChange({ ...value, tablet: v }, isHidden)} label="Tableta" />
          <Switch checked={value.mobile} onChange={(v) => onChange({ ...value, mobile: v }, isHidden)} label="Móvil" />
        </div>
      </div>
    </details>
  );
}
