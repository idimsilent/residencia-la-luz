"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { saveNews } from "@/features/news/actions";
import type { NEWS_MODES } from "@/features/news/schema";
import { mediaPublicUrl, type MediaLite } from "@/features/media/url";
import { RichTextEditor } from "../rich-text-editor";
import { MediaField, MediaListField } from "../media-picker";
import { Badge, Button, Card, Field, Input, Select, Switch, Textarea, useAdminHref, useToast } from "../ui";
import { cn, slugify } from "@/lib/utils";
import { newsStatus } from "./news-table";

type Mode = (typeof NEWS_MODES)[number];

export type NewsEditorInitial = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured: MediaLite | null;
  gallery: MediaLite[];
  category_id: string;
  author_name: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  scheduled_date: string;
  scheduled_time: string;
};

const MODE_LABELS: Record<Mode, { label: string; hint: string }> = {
  draft: { label: "Borrador", hint: "Solo visible en el panel." },
  publish: { label: "Publicar ahora", hint: "Aparece en la web al guardar." },
  schedule: { label: "Programar", hint: "Se publicará sola en la fecha indicada (hora de Madrid)." },
  archive: { label: "Archivar", hint: "Se retira de la web sin borrarla." },
};

function initialMode(i: NewsEditorInitial): Mode {
  if (i.status === "draft") return "draft";
  if (i.status === "archived") return "archive";
  if (i.published_at && new Date(i.published_at) > new Date()) return "schedule";
  return "publish";
}

export function NewsEditor({ initial, categories }: { initial: NewsEditorInitial; categories: { id: string; name: string }[] }) {
  const [v, setV] = useState(initial);
  const [mode, setMode] = useState<Mode>(() => initialMode(initial));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const href = useAdminHref();

  const set = <K extends keyof NewsEditorInitial>(key: K, value: NewsEditorInitial[K]) => {
    setV((s) => ({ ...s, [key]: value, ...(key === "title" && !slugTouched ? { slug: slugify(String(value)) } : {}) }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = () =>
    startTransition(async () => {
      const res = await saveNews({
        id: v.id,
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt,
        content_html: v.content_html,
        featured_media_id: v.featured?.id ?? null,
        gallery_ids: v.gallery.map((g) => g.id),
        category_id: v.category_id || null,
        author_name: v.author_name,
        mode,
        scheduled_date: mode === "schedule" ? v.scheduled_date : "",
        scheduled_time: mode === "schedule" ? v.scheduled_time : "",
        is_featured: v.is_featured,
        seo_title: v.seo_title,
        seo_description: v.seo_description,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast("error", res.error);
        return;
      }
      setErrors({});
      setDirty(false);
      toast("success", res.message ?? "Guardado.");
      if (res.data) {
        setV((s) => ({ ...s, id: res.data!.id, slug: res.data!.slug }));
        setSlugTouched(true);
        if (!v.id) router.replace(href(`/noticias/${res.data.id}`));
        else router.refresh();
      }
    });

  const st = initial.id ? newsStatus(initial.status, initial.published_at) : null;
  const previewDate = useMemo(() => {
    const d = mode === "schedule" && v.scheduled_date ? new Date(`${v.scheduled_date}T${v.scheduled_time || "00:00"}`) : v.published_at ? new Date(v.published_at) : new Date();
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "Europe/Madrid" }).format(d);
  }, [mode, v.scheduled_date, v.scheduled_time, v.published_at]);
  const categoryName = categories.find((c) => c.id === v.category_id)?.name;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={href("/noticias")} prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Noticias
        </Link>
        <h1 className="text-xl text-stone-900">{initial.id ? "Editar noticia" : "Nueva noticia"}</h1>
        {st ? <Badge tone={st.tone}>{st.label}</Badge> : null}
        {dirty ? <span className="text-xs font-bold text-amber-700">Cambios sin guardar</span> : null}
        <span className="ml-auto flex flex-wrap gap-2">
          {initial.id ? (
            <a
              href={`/api/preview?ruta=${encodeURIComponent(`/noticias/${v.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 hover:bg-stone-50"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver en la web
            </a>
          ) : null}
          <Button onClick={save} loading={pending}>
            {mode === "draft" ? "Guardar borrador" : mode === "publish" ? "Guardar y publicar" : mode === "schedule" ? "Programar" : "Archivar"}
          </Button>
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <Field label="Título" htmlFor="n-title" required error={errors.title}>
                <Input id="n-title" value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className="text-lg font-bold" />
              </Field>
              <Field label="Contenido" error={errors.content_html}>
                <RichTextEditor value={v.content_html} onChange={(html) => set("content_html", html)} ariaLabel="Contenido de la noticia" />
              </Field>
              <Field label="Resumen" htmlFor="n-excerpt" hint="Se muestra en el listado de noticias. Si lo dejas vacío se genera con el principio del texto." error={errors.excerpt}>
                <Textarea id="n-excerpt" value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} maxLength={500} rows={2} />
              </Field>
            </div>
          </Card>

          <Card title="Fotografías">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-sm font-bold text-stone-800">Imagen principal</p>
                <MediaField value={v.featured} onChange={(m) => set("featured", m)} label="Imagen principal" />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-bold text-stone-800">Galería de la noticia</p>
                <MediaListField value={v.gallery} onChange={(m) => set("gallery", m)} />
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-500">
              Recuerda: no publiques fotografías en las que se pueda identificar a residentes sin su consentimiento expreso por escrito.
            </p>
          </Card>

          <Card title="Posicionamiento en buscadores (opcional)">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título para buscadores" htmlFor="n-seo-title" hint={`${v.seo_title.length}/70`} error={errors.seo_title}>
                <Input id="n-seo-title" value={v.seo_title} onChange={(e) => set("seo_title", e.target.value)} maxLength={70} placeholder={v.title} />
              </Field>
              <Field label="Dirección (URL)" htmlFor="n-slug" hint={`/noticias/${v.slug || "…"}`} error={errors.slug}>
                <Input
                  id="n-slug"
                  value={v.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  maxLength={100}
                />
              </Field>
              <Field label="Descripción para buscadores" htmlFor="n-seo-desc" hint={`${v.seo_description.length}/170`} error={errors.seo_description} className="md:col-span-2">
                <Textarea id="n-seo-desc" value={v.seo_description} onChange={(e) => set("seo_description", e.target.value)} maxLength={170} rows={2} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Publicación">
            <fieldset className="space-y-2">
              <legend className="sr-only">Estado al guardar</legend>
              {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                <label key={m} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3", mode === m ? "border-sage-500 bg-sage-50" : "border-stone-200 hover:bg-stone-50")}>
                  <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => { setMode(m); setDirty(true); }} className="mt-1 accent-sage-600" />
                  <span>
                    <span className="block text-sm font-bold text-stone-900">{MODE_LABELS[m].label}</span>
                    <span className="block text-xs text-stone-500">{MODE_LABELS[m].hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {mode === "schedule" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Fecha" htmlFor="n-date" error={errors.scheduled_date}>
                  <Input id="n-date" type="date" value={v.scheduled_date} onChange={(e) => set("scheduled_date", e.target.value)} />
                </Field>
                <Field label="Hora" htmlFor="n-time">
                  <Input id="n-time" type="time" value={v.scheduled_time} onChange={(e) => set("scheduled_time", e.target.value)} />
                </Field>
              </div>
            ) : null}
            <div className="mt-4 space-y-4 border-t border-stone-100 pt-4">
              <Field label="Categoría" htmlFor="n-cat">
                <Select id="n-cat" value={v.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Firma (opcional)" htmlFor="n-author" hint="Por ejemplo: «Equipo de animación». Evita nombres de residentes.">
                <Input id="n-author" value={v.author_name} onChange={(e) => set("author_name", e.target.value)} maxLength={120} />
              </Field>
              <Switch checked={v.is_featured} onChange={(c) => set("is_featured", c)} label="Destacar en la portada" />
            </div>
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" aria-hidden="true" /> Vista previa
              </span>
            }
            actions={
              <div className="flex rounded-lg bg-stone-100 p-0.5" role="group" aria-label="Tamaño de la vista previa">
                <button type="button" onClick={() => setDevice("desktop")} aria-pressed={device === "desktop"} className={cn("rounded-md p-1.5", device === "desktop" && "bg-white shadow-sm")} aria-label="Ordenador">
                  <Monitor className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setDevice("mobile")} aria-pressed={device === "mobile"} className={cn("rounded-md p-1.5", device === "mobile" && "bg-white shadow-sm")} aria-label="Móvil">
                  <Smartphone className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            }
          >
            <div className={cn("mx-auto overflow-hidden rounded-xl border border-stone-200 bg-[#fbfaf6]", device === "mobile" ? "max-w-[22rem]" : "")}>
              {v.featured ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaPublicUrl(v.featured.storage_path)} alt={v.featured.alt_text} className="aspect-video w-full object-cover" />
              ) : null}
              <article className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-sage-700">
                  {categoryName ?? "Noticias"} · {previewDate}
                </p>
                <h2 className="mt-1 text-xl leading-tight text-stone-900">{v.title || "Título de la noticia"}</h2>
                {v.excerpt ? <p className="mt-2 text-sm text-stone-600">{v.excerpt}</p> : null}
                <div className="mt-3 max-h-[32rem] overflow-y-auto text-sm" aria-label="Contenido">
                  {/* El HTML procede del editor (formatos limitados) y se sanea de nuevo en el servidor al guardar. */}
                  <div className="prose-site preview-body" dangerouslySetInnerHTML={{ __html: v.content_html || "<p><em>El contenido aparecerá aquí.</em></p>" }} />
                </div>
              </article>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
