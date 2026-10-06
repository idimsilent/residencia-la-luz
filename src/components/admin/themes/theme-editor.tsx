"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, RotateCcw, Undo2 } from "lucide-react";
import type { ThemeTokens } from "@/features/theme/schema";
import { FONT_OPTIONS } from "@/features/theme/fonts";
import { contrastRatio } from "@/features/theme/css";
import { discardThemeDraft, publishTheme, resetThemeDraft, saveThemeDraft } from "@/features/theme/actions";
import type { AnyBlock } from "@/features/blocks/schema";
import type { BlockData } from "@/features/blocks/data";
import { BlockView } from "@/components/blocks/blocks-view";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import type { NavItem } from "@/components/public/nav-links";
import type { OpeningHour, SocialLink } from "@/features/site/queries";
import type { MediaLite } from "@/features/media/url";
import { DeviceSwitch, PreviewFrame, type Device } from "../preview-frame";
import { Badge, Button, Field, Input, Select, Switch, useAdminHref, useConfirm, useToast } from "../ui";
import { cn } from "@/lib/utils";

type Colors = ThemeTokens["colors"];

const COLOR_GROUPS: { title: string; items: { key: keyof Colors; label: string }[] }[] = [
  {
    title: "Colores principales",
    items: [
      { key: "primary", label: "Principal" },
      { key: "primaryContrast", label: "Texto sobre el principal" },
      { key: "secondary", label: "Secundario" },
      { key: "accent", label: "Acento" },
    ],
  },
  {
    title: "Fondos y texto",
    items: [
      { key: "background", label: "Fondo de la página" },
      { key: "surface", label: "Fondo de tarjetas" },
      { key: "surfaceAlt", label: "Fondo suave de secciones" },
      { key: "text", label: "Texto" },
      { key: "textMuted", label: "Texto secundario" },
      { key: "border", label: "Bordes" },
    ],
  },
  {
    title: "Botones, cabecera y pie",
    items: [
      { key: "buttonBg", label: "Fondo de botones" },
      { key: "buttonText", label: "Texto de botones" },
      { key: "headerBg", label: "Fondo de la cabecera" },
      { key: "headerText", label: "Texto de la cabecera" },
      { key: "footerBg", label: "Fondo del pie" },
      { key: "footerText", label: "Texto del pie" },
    ],
  },
];

const CONTRAST_PAIRS: { fg: keyof Colors; bg: keyof Colors; label: string; min: number }[] = [
  { fg: "text", bg: "background", label: "Texto sobre el fondo", min: 4.5 },
  { fg: "textMuted", bg: "background", label: "Texto secundario sobre el fondo", min: 4.5 },
  { fg: "text", bg: "surfaceAlt", label: "Texto sobre secciones suaves", min: 4.5 },
  { fg: "buttonText", bg: "buttonBg", label: "Texto de los botones", min: 4.5 },
  { fg: "primaryContrast", bg: "primary", label: "Texto sobre el color principal", min: 4.5 },
  { fg: "headerText", bg: "headerBg", label: "Texto de la cabecera", min: 4.5 },
  { fg: "footerText", bg: "footerBg", label: "Texto del pie", min: 4.5 },
];

export type ThemePreviewContext = {
  blocks: AnyBlock[];
  data: BlockData;
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string[];
  hours: OpeningHour[];
  social: SocialLink[];
  logo: MediaLite | null;
  header: NavItem[];
  footer: NavItem[];
  legal: NavItem[];
};

export function ThemeEditor({
  theme,
  preview,
}: {
  theme: { id: string; name: string; tokens: ThemeTokens; hasDraft: boolean; isActive: boolean; isPreset: boolean };
  preview: ThemePreviewContext;
}) {
  const [name, setName] = useState(theme.name);
  const [t, setT] = useState<ThemeTokens>(theme.tokens);
  const [tab, setTab] = useState<"colores" | "tipografia" | "formas" | "componentes">("colores");
  const [device, setDevice] = useState<Device>("desktop");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patch = <K extends keyof ThemeTokens>(section: K, values: Partial<ThemeTokens[K]>) => {
    setT((s) => ({ ...s, [section]: { ...(s[section] as object), ...values } }));
    setDirty(true);
  };

  const contrast = useMemo(
    () => CONTRAST_PAIRS.map((p) => ({ ...p, ratio: contrastRatio(t.colors[p.fg], t.colors[p.bg]) })),
    [t.colors],
  );
  const failing = contrast.filter((c) => c.ratio < c.min);

  const saveDraft = (then?: () => void) =>
    startTransition(async () => {
      const res = await saveThemeDraft({ id: theme.id, name, tokens: t });
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("success", res.message ?? "Guardado.");
      then?.();
    });

  const publish = async () => {
    const ok = await confirm({
      title: theme.isActive ? "¿Publicar los cambios del tema?" : "¿Publicar y aplicar este tema?",
      message: (
        <>
          {failing.length ? (
            <p className="mb-2 font-bold text-[#912018]">Atención: hay {failing.length} combinaciones de color con poco contraste, que dificultan la lectura.</p>
          ) : null}
          <p>La web cambiará de aspecto para todas las visitas.</p>
        </>
      ),
      confirmLabel: "Publicar",
      tone: "primary",
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await publishTheme({ id: theme.id, name, tokens: t, activate: true });
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("success", res.message ?? "Publicado.");
      router.refresh();
    });
  };

  const fontOptions = Object.entries(FONT_OPTIONS) as [ThemeTokens["typography"]["headingFont"], { label: string }][];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <Link href={href("/apariencia")} prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Temas
        </Link>
        <label className="sr-only" htmlFor="theme-name">
          Nombre del tema
        </label>
        <input id="theme-name" value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} maxLength={80} className="rounded-md border border-transparent px-2 py-1 text-lg font-extrabold text-stone-900 hover:border-stone-300 focus:border-sage-500 focus:outline-none" />
        {theme.isActive ? <Badge tone="success">Aplicado en la web</Badge> : null}
        {theme.hasDraft && !dirty ? <Badge tone="info">Borrador guardado</Badge> : null}
        {dirty ? <span className="text-xs font-bold text-amber-700">Sin guardar</span> : null}
        <span className="ml-auto flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (await confirm({ title: "¿Restablecer el tema?", message: "Se cargarán los valores originales del tema como borrador. La web no cambia hasta que publiques.", confirmLabel: "Restablecer", tone: "primary" }))
                startTransition(async () => {
                  const r = await resetThemeDraft(theme.id);
                  if (!r.ok) return toast("error", r.error);
                  setDirty(false);
                  toast("success", r.message ?? "Restablecido.");
                  router.refresh();
                });
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restablecer
          </Button>
          {theme.hasDraft || dirty ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (await confirm({ title: "¿Descartar los cambios?", message: "Volverá a la última versión publicada del tema.", confirmLabel: "Descartar" }))
                  startTransition(async () => {
                    const r = await discardThemeDraft(theme.id);
                    if (!r.ok) return toast("error", r.error);
                    setDirty(false);
                    router.refresh();
                  });
              }}
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Descartar
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => saveDraft(() => window.open(`/api/preview?ruta=/&tema=${theme.id}`, "_blank", "noopener"))}
            disabled={pending}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Probar en la web
          </Button>
          <Button size="sm" variant="secondary" onClick={() => saveDraft()} loading={pending} disabled={!dirty}>
            Guardar borrador
          </Button>
          <Button size="sm" onClick={publish} loading={pending}>
            {theme.isActive ? "Publicar cambios" : "Publicar y aplicar"}
          </Button>
        </span>
      </div>

      <div className="grid flex-1 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="border-b border-stone-200 bg-[#fbfaf7] p-4 lg:sticky lg:top-[3.75rem] lg:h-[calc(100vh-3.75rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="mb-4 grid grid-cols-4 rounded-lg bg-stone-200/70 p-1 text-xs font-bold" role="tablist" aria-label="Secciones del tema">
            {(
              [
                ["colores", "Colores"],
                ["tipografia", "Letra"],
                ["formas", "Formas"],
                ["componentes", "Estilos"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("rounded-md px-2 py-1.5", tab === k ? "bg-white shadow-sm" : "text-stone-600")}>
                {label}
              </button>
            ))}
          </div>

          {tab === "colores" ? (
            <div className="space-y-5">
              <section aria-label="Contraste" className={cn("rounded-xl p-3 text-xs", failing.length ? "bg-amber-50 text-amber-950" : "bg-sage-50 text-sage-900")}>
                {failing.length ? (
                  <>
                    <p className="mb-1 flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Contraste insuficiente (mínimo 4,5:1)
                    </p>
                    <ul className="space-y-0.5">
                      {failing.map((c) => (
                        <li key={c.label}>
                          {c.label}: {c.ratio.toFixed(2).replace(".", ",")}:1
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Todos los textos tienen buen contraste.
                  </p>
                )}
              </section>
              {COLOR_GROUPS.map((g) => (
                <fieldset key={g.title}>
                  <legend className="mb-2 text-sm font-bold text-stone-800">{g.title}</legend>
                  <div className="space-y-2">
                    {g.items.map((it) => (
                      <ColorInput key={it.key} label={it.label} value={t.colors[it.key]} onChange={(v) => patch("colors", { [it.key]: v } as Partial<Colors>)} />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          ) : null}

          {tab === "tipografia" ? (
            <div className="space-y-4">
              <Field label="Letra de los títulos" htmlFor="tf-h">
                <Select id="tf-h" value={t.typography.headingFont} onChange={(e) => patch("typography", { headingFont: e.target.value as ThemeTokens["typography"]["headingFont"] })}>
                  {fontOptions.map(([k, o]) => (
                    <option key={k} value={k}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Letra del texto" htmlFor="tf-b">
                <Select id="tf-b" value={t.typography.bodyFont} onChange={(e) => patch("typography", { bodyFont: e.target.value as ThemeTokens["typography"]["bodyFont"] })}>
                  {fontOptions.map(([k, o]) => (
                    <option key={k} value={k}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Range label="Tamaño del texto" value={t.typography.baseSize} min={16} max={20} step={1} unit="px" onChange={(v) => patch("typography", { baseSize: v })} hint="Para personas mayores recomendamos 17 px o más." />
              <Range label="Tamaño de los títulos" value={t.typography.headingScale} min={1.1} max={1.45} step={0.05} onChange={(v) => patch("typography", { headingScale: Math.round(v * 100) / 100 })} />
              <Field label="Grosor de los títulos" htmlFor="tf-w">
                <Select id="tf-w" value={t.typography.headingWeight} onChange={(e) => patch("typography", { headingWeight: e.target.value as ThemeTokens["typography"]["headingWeight"] })}>
                  <option value="500">Normal</option>
                  <option value="600">Semi negrita</option>
                  <option value="700">Negrita</option>
                </Select>
              </Field>
            </div>
          ) : null}

          {tab === "formas" ? (
            <div className="space-y-4">
              <Range label="Redondeo de esquinas" value={t.shape.radius} min={0} max={32} step={1} unit="px" onChange={(v) => patch("shape", { radius: v })} />
              <Opt label="Sombras" value={t.shape.shadow} options={{ none: "Sin sombra", soft: "Suaves", medium: "Marcadas" }} onChange={(v) => patch("shape", { shadow: v })} />
              <Opt label="Espaciado" value={t.shape.spacing} options={{ compact: "Compacto", normal: "Normal", airy: "Amplio" }} onChange={(v) => patch("shape", { spacing: v })} />
              <Opt label="Ancho del contenido" value={t.shape.contentWidth} options={{ narrow: "Estrecho", normal: "Normal", wide: "Ancho" }} onChange={(v) => patch("shape", { contentWidth: v })} />
            </div>
          ) : null}

          {tab === "componentes" ? (
            <div className="space-y-4">
              <Opt label="Botones" value={t.components.buttonStyle} options={{ solid: "Sólidos", soft: "Suaves", outline: "Contorno", pill: "Redondeados" }} onChange={(v) => patch("components", { buttonStyle: v })} />
              <Opt label="Tarjetas" value={t.components.cardStyle} options={{ elevated: "Con sombra", bordered: "Con borde", flat: "Planas" }} onChange={(v) => patch("components", { cardStyle: v })} />
              <Opt label="Cabecera" value={t.components.headerLayout} options={{ classic: "Clásica", centered: "Centrada", minimal: "Mínima" }} onChange={(v) => patch("components", { headerLayout: v })} />
              <Switch checked={t.components.headerSticky} onChange={(v) => patch("components", { headerSticky: v })} label="Cabecera fija al desplazarse" />
              <Opt label="Menú" value={t.components.menuStyle} options={{ underline: "Subrayado", pill: "Píldora", plain: "Sencillo" }} onChange={(v) => patch("components", { menuStyle: v })} />
              <Opt label="Pie de página" value={t.components.footerLayout} options={{ columns: "En columnas", simple: "Sencillo" }} onChange={(v) => patch("components", { footerLayout: v })} />
              <Opt label="Galería" value={t.components.galleryStyle} options={{ grid: "Cuadrícula", mosaic: "Mosaico" }} onChange={(v) => patch("components", { galleryStyle: v })} />
              <Opt label="Noticias" value={t.components.newsCardStyle} options={{ cards: "Tarjetas", feed: "Lista tipo muro" }} onChange={(v) => patch("components", { newsCardStyle: v })} />
              <Opt label="Secciones" value={t.components.blockStyle} options={{ open: "Abiertas", boxed: "En recuadros" }} onChange={(v) => patch("components", { blockStyle: v })} />
            </div>
          ) : null}
        </aside>

        <section className="min-w-0 bg-stone-100 p-4 sm:p-6" aria-label="Vista previa del tema">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Vista previa en directo</p>
            <DeviceSwitch value={device} onChange={setDevice} />
          </div>
          <PreviewFrame device={device} theme={t}>
            <SiteHeader siteName={preview.siteName} logo={preview.logo} items={preview.header} phone={preview.phone} layout={t.components.headerLayout} sticky={false} />
            <main className="flex-1">
              {preview.blocks.map((b, i) => (
                <BlockView key={b.key} block={b} ctx={{ data: preview.data, theme: t.components, isEditorPreview: true, first: i === 0 }} />
              ))}
            </main>
            <SiteFooter
              siteName={preview.siteName}
              tagline={preview.tagline}
              address={preview.address}
              phone={preview.phone}
              email={preview.email}
              hours={preview.hours}
              social={preview.social}
              mainLinks={preview.footer}
              legalLinks={preview.legal}
              layout={t.components.footerLayout}
            />
          </PreviewFrame>
        </section>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  // Texto mientras se escribe; se sincroniza cuando el valor cambia desde fuera (selector de color).
  const [draft, setDraft] = useState<{ base: string; text: string }>({ base: value, text: value });
  const text = draft.base === value ? draft.text : value;
  const setText = (t: string) => setDraft({ base: value, text: t });
  const id = label.replace(/\W+/g, "-");
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} (selector)`} className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-stone-300 bg-white p-0.5" />
      <label htmlFor={id} className="min-w-0 flex-1 text-sm text-stone-700">
        {label}
      </label>
      <Input
        id={id}
        value={text}
        maxLength={7}
        className="!w-24 font-mono text-xs"
        onChange={(e) => {
          setText(e.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value.toLowerCase());
        }}
        aria-invalid={!/^#[0-9a-fA-F]{6}$/.test(text) || undefined}
      />
    </div>
  );
}

function Range({ label, value, min, max, step, unit = "", onChange, hint }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; hint?: string }) {
  const id = label.replace(/\W+/g, "-");
  return (
    <Field label={`${label}: ${String(value).replace(".", ",")}${unit}`} htmlFor={id} hint={hint}>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sage-600" />
    </Field>
  );
}

function Opt<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Record<T, string>; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-stone-800">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(options) as T[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => onChange(k)}
            className={cn("rounded-lg border px-3 py-1.5 text-sm", value === k ? "border-sage-600 bg-sage-100 font-bold text-sage-900" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50")}
          >
            {options[k]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
