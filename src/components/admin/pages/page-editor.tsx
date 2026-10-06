"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Copy, ExternalLink, Eye, EyeOff, History, Plus, Settings2, Trash2, Undo2 } from "lucide-react";
import { BLOCK_LABELS, BLOCK_TYPES, defaultBlock, newBlockKey, parseBlock, type AnyBlock, type BlockType } from "@/features/blocks/schema";
import type { BlockData } from "@/features/blocks/data";
import type { ThemeTokens } from "@/features/theme/schema";
import type { MediaLite } from "@/features/media/url";
import { discardPageDraft, publishPage, restorePageRevision, savePageDraft, updatePageSettings } from "@/features/pages/actions";
import { BlockView } from "@/components/blocks/blocks-view";
import { SortableList } from "../sortable-list";
import { DeviceSwitch, PreviewFrame, type Device } from "../preview-frame";
import { MediaField } from "../media-picker";
import { Badge, Button, Dialog, Field, Input, Textarea, useAdminHref, useConfirm, useToast } from "../ui";
import { BlockForm } from "./block-forms";
import { cn } from "@/lib/utils";

export type EditorPage = {
  id: string;
  title: string;
  slug: string;
  kind: string;
  is_system: boolean;
  status: "draft" | "published";
  has_unpublished_changes: boolean;
  seo_title: string;
  seo_description: string;
  og_media: MediaLite | null;
  publicPath: string;
};

export type Revision = { id: string; version: number; note: string | null; created_at: string; isPublished: boolean };

const KIND_NOTES: Record<string, string> = {
  home: "",
  services: "Debajo de estos bloques se muestra automáticamente el listado de servicios.",
  gallery: "Debajo de estos bloques se muestra automáticamente la galería de instalaciones con sus filtros.",
  news: "Debajo de estos bloques se muestra automáticamente el listado de noticias con buscador.",
  events: "Debajo de estos bloques se muestra automáticamente el calendario de eventos.",
  contact: "Debajo de estos bloques se muestra automáticamente el formulario y los datos de contacto.",
  legal: "",
  blocks: "",
};

export function PageEditor({
  page,
  initialBlocks,
  data,
  theme,
  revisions,
}: {
  page: EditorPage;
  initialBlocks: AnyBlock[];
  data: BlockData;
  theme: ThemeTokens;
  revisions: Revision[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selected, setSelected] = useState<string | null>(null);
  const [media, setMedia] = useState<Record<string, MediaLite>>(data.media);
  const [device, setDevice] = useState<Device>("desktop");
  const [dirty, setDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(page.has_unpublished_changes);
  const [addOpen, setAddOpen] = useState<{ at: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  const errors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const b of blocks) {
      const r = parseBlock({ type: b.type, props: b.props, isHidden: b.isHidden, visibility: b.visibility, schemaVersion: b.schemaVersion });
      if (!r.ok) out[b.key] = r.message;
    }
    return out;
  }, [blocks]);
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const update = (next: AnyBlock[]) => {
    setBlocks(next);
    setDirty(true);
  };
  const updateBlock = (b: AnyBlock) => update(blocks.map((x) => (x.key === b.key ? b : x)));
  const addMedia = (m: MediaLite) => setMedia((s) => (s[m.id] ? s : { ...s, [m.id]: m }));

  const payload = () => blocks.map(({ type, props, isHidden, visibility, schemaVersion }) => ({ type, props, isHidden, visibility, schemaVersion }));

  const saveDraft = () =>
    startTransition(async () => {
      const res = await savePageDraft({ pageId: page.id, blocks: payload() });
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      setHasDraft(true);
      toast("success", res.message ?? "Guardado.");
    });

  const publish = async () => {
    if (errorCount) return toast("error", "Corrige los bloques marcados en rojo antes de publicar.");
    const ok = await confirm({
      title: "¿Publicar la página?",
      message: "Los cambios se verán en la web inmediatamente. Se guardará una copia de la versión actual en el historial.",
      confirmLabel: "Publicar",
      tone: "primary",
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await publishPage({ pageId: page.id, blocks: payload() });
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      setHasDraft(false);
      toast("success", res.message ?? "Publicada.");
      router.refresh();
    });
  };

  const discard = async () => {
    const ok = await confirm({ title: "¿Descartar los cambios?", message: "Se perderán los cambios no publicados y volverá a la versión que se ve en la web.", confirmLabel: "Descartar" });
    if (!ok) return;
    startTransition(async () => {
      const res = await discardPageDraft(page.id);
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("success", res.message ?? "Descartados.");
      router.refresh();
    });
  };

  const insertAt = (type: BlockType, at: number) => {
    const b = defaultBlock(type);
    const next = [...blocks];
    next.splice(at, 0, b);
    update(next);
    setSelected(b.key);
    setAddOpen(null);
  };

  const current = blocks.find((b) => b.key === selected) ?? null;
  const kindNote = KIND_NOTES[page.kind] ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra superior */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <Link href={href("/paginas")} prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Páginas
        </Link>
        <h1 className="truncate text-lg text-stone-900">{page.title}</h1>
        {page.status === "draft" ? <Badge tone="warning">Sin publicar</Badge> : hasDraft || dirty ? <Badge tone="info">Cambios sin publicar</Badge> : <Badge tone="success">Publicada</Badge>}
        {dirty ? <span className="text-xs font-bold text-amber-700">Sin guardar</span> : null}
        <span className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Ajustes
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(true)} disabled={!revisions.length}>
            <History className="h-4 w-4" aria-hidden="true" /> Historial
          </Button>
          {page.status === "published" ? (
            <a href={`/api/preview?ruta=${encodeURIComponent(page.publicPath)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-stone-700 hover:bg-stone-200/60">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver borrador en la web
            </a>
          ) : null}
          {(hasDraft || dirty) && page.status === "published" ? (
            <Button size="sm" variant="ghost" onClick={discard} disabled={pending}>
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Descartar
            </Button>
          ) : null}
          <Button size="sm" variant="secondary" onClick={saveDraft} loading={pending} disabled={!dirty}>
            Guardar borrador
          </Button>
          <Button size="sm" onClick={publish} loading={pending}>
            Publicar
          </Button>
        </span>
      </div>

      <div className="grid flex-1 lg:grid-cols-[26rem_minmax(0,1fr)]">
        {/* Panel de bloques */}
        <aside className="border-b border-stone-200 bg-[#fbfaf7] p-4 lg:sticky lg:top-[3.75rem] lg:h-[calc(100vh-3.75rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          {current ? (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Bloques
                </Button>
                <h2 className="text-base text-stone-900">{BLOCK_LABELS[current.type].label}</h2>
              </div>
              {errors[current.key] ? (
                <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-red-50 p-2 text-xs font-bold text-[#912018]" role="alert">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> Revisa este bloque: {errors[current.key]}
                </p>
              ) : null}
              <BlockForm key={current.key} block={current} onChange={updateBlock} media={media} onMedia={addMedia} />
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base text-stone-900">Bloques de la página</h2>
                <Button size="sm" onClick={() => setAddOpen({ at: blocks.length })} disabled={blocks.length >= 60}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Añadir
                </Button>
              </div>
              {kindNote ? <p className="mb-3 rounded-lg bg-sky-50 p-2.5 text-xs text-sky-900">{kindNote}</p> : null}
              {errorCount ? (
                <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-bold text-[#912018]" role="alert">
                  {errorCount === 1 ? "Hay un bloque con datos incompletos." : `Hay ${errorCount} bloques con datos incompletos.`}
                </p>
              ) : null}
              {!blocks.length ? <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Esta página aún no tiene bloques.</p> : null}
              <SortableList
                items={blocks.map((b) => ({ ...b, id: b.key }))}
                label="Bloque"
                onReorder={(list) => update(list.map((b) => blocks.find((x) => x.key === b.id)!))}
                className="space-y-1.5"
                itemClassName={cn("rounded-xl border bg-white px-1.5 py-1.5")}
                renderItem={(b, i) => (
                  <div className={cn("flex items-center gap-1", errors[b.key] && "text-[#912018]")}>
                    <button type="button" onClick={() => setSelected(b.key)} className="min-w-0 flex-1 rounded-md px-1.5 py-1 text-left hover:bg-stone-50">
                      <span className={cn("block truncate text-sm font-bold", b.isHidden && "text-stone-400 line-through")}>
                        {i + 1}. {BLOCK_LABELS[b.type].label}
                      </span>
                      <span className="block truncate text-xs text-stone-500">{blockSummary(b)}</span>
                    </button>
                    {errors[b.key] ? <AlertTriangle className="h-4 w-4 shrink-0" aria-label="Datos incompletos" /> : null}
                    <button
                      type="button"
                      onClick={() => updateBlock({ ...b, isHidden: !b.isHidden } as AnyBlock)}
                      className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
                      aria-label={b.isHidden ? "Mostrar bloque" : "Ocultar bloque"}
                      title={b.isHidden ? "Mostrar" : "Ocultar"}
                    >
                      {b.isHidden ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...structuredClone(b), key: newBlockKey() } as AnyBlock;
                        const next = [...blocks];
                        next.splice(i + 1, 0, copy);
                        update(next);
                      }}
                      className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
                      aria-label="Duplicar bloque"
                      title="Duplicar"
                      disabled={blocks.length >= 60}
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirm({ title: "¿Eliminar el bloque?", message: `«${BLOCK_LABELS[b.type].label}» se quitará de la página. Hasta que publiques, puedes descartar los cambios.`, confirmLabel: "Eliminar" }))
                          update(blocks.filter((x) => x.key !== b.key));
                      }}
                      className="rounded-md p-1.5 text-[#b42318] hover:bg-red-50"
                      aria-label="Eliminar bloque"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              />
            </div>
          )}
        </aside>

        {/* Vista previa en vivo */}
        <section className="min-w-0 bg-stone-100 p-4 sm:p-6" aria-label="Vista previa">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Vista previa en directo · haz clic en un bloque para editarlo</p>
            <DeviceSwitch value={device} onChange={setDevice} />
          </div>
          <PreviewFrame device={device} theme={theme}>
            <main className="flex-1">
              {blocks.map((b, i) => (
                <div
                  key={b.key}
                  onClick={() => setSelected(b.key)}
                  className={cn(
                    "relative cursor-pointer outline-offset-[-3px] hover:outline hover:outline-2 hover:outline-[#5f7d63]/60",
                    selected === b.key && "outline outline-[3px] outline-[#5f7d63]",
                    b.isHidden && "opacity-40",
                  )}
                >
                  {b.isHidden ? (
                    <span className="absolute left-2 top-2 z-10 rounded bg-stone-800 px-2 py-0.5 text-xs font-bold text-white">Oculto</span>
                  ) : null}
                  {errors[b.key] ? (
                    <div className="m-4 rounded-lg border-2 border-dashed border-red-400 p-6 text-center text-sm text-red-800">Bloque incompleto: {errors[b.key]}</div>
                  ) : (
                    <BlockView block={b} ctx={{ data: { ...data, media }, theme: theme.components, isEditorPreview: true, first: i === 0 }} />
                  )}
                </div>
              ))}
              {kindNote ? (
                <div className="container-site py-10">
                  <div className="rounded-xl border-2 border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">{kindNote}</div>
                </div>
              ) : null}
            </main>
          </PreviewFrame>
        </section>
      </div>

      {addOpen ? (
        <Dialog open onClose={() => setAddOpen(null)} title="Añadir bloque" size="lg">
          <ul className="grid gap-2 sm:grid-cols-2">
            {BLOCK_TYPES.map((t) => (
              <li key={t}>
                <button type="button" onClick={() => insertAt(t, addOpen.at)} className="h-full w-full rounded-xl border border-stone-200 p-3 text-left hover:border-sage-500 hover:bg-sage-50">
                  <span className="block font-bold text-stone-900">{BLOCK_LABELS[t].label}</span>
                  <span className="block text-xs text-stone-500">{BLOCK_LABELS[t].description}</span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}

      {settingsOpen ? <PageSettingsDialog page={page} onClose={() => setSettingsOpen(false)} /> : null}

      {historyOpen ? (
        <Dialog open onClose={() => setHistoryOpen(false)} title="Historial de versiones publicadas">
          <ul className="divide-y divide-stone-100">
            {revisions.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm">
                  <strong>Versión {r.version}</strong>{" "}
                  <span className="text-stone-500">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(r.created_at))}</span>
                  {r.isPublished ? <Badge tone="success">En la web</Badge> : null}
                  {r.note ? <span className="block text-xs text-stone-500">{r.note}</span> : null}
                </span>
                {!r.isPublished ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      if (!(await confirm({ title: `¿Recuperar la versión ${r.version}?`, message: "Sustituirá el borrador actual. La web no cambia hasta que publiques.", confirmLabel: "Recuperar", tone: "primary" }))) return;
                      startTransition(async () => {
                        const res = await restorePageRevision(r.id);
                        if (!res.ok) return toast("error", res.error);
                        toast("success", res.message ?? "Recuperada.");
                        setHistoryOpen(false);
                        setDirty(false);
                        router.refresh();
                      });
                    }}
                  >
                    Recuperar
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Dialog>
      ) : null}
    </div>
  );
}

function blockSummary(b: AnyBlock): string {
  const p = b.props as Record<string, unknown>;
  if (typeof p.title === "string" && p.title) return p.title;
  if (b.type === "rich-text") return b.props.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "Texto";
  if (b.type === "video") return b.props.videoId ? `${b.props.provider} · ${b.props.videoId}` : "Sin vídeo";
  if (b.type === "spacer") return b.props.divider ? "Con línea" : "Espacio";
  return BLOCK_LABELS[b.type].description;
}

function PageSettingsDialog({ page, onClose }: { page: EditorPage; onClose: () => void }) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seo_title);
  const [seoDesc, setSeoDesc] = useState(page.seo_description);
  const [og, setOg] = useState<MediaLite | null>(page.og_media);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const save = () =>
    startTransition(async () => {
      const res = await updatePageSettings({ id: page.id, title, slug, seo_title: seoTitle, seo_description: seoDesc, og_media_id: og?.id ?? null });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return toast("error", res.error);
      }
      toast("success", res.message ?? "Guardado.");
      onClose();
      router.refresh();
    });

  return (
    <Dialog
      open
      onClose={onClose}
      title="Ajustes de la página"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={pending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título de la página" htmlFor="ps-title" required error={errors.title}>
          <Input id="ps-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
        </Field>
        <Field label="Dirección (URL)" htmlFor="ps-slug" hint={page.is_system ? "Las páginas principales tienen una dirección fija." : `/${slug}`} error={errors.slug}>
          <Input id="ps-slug" value={slug} disabled={page.is_system} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} maxLength={80} />
        </Field>
        <Field label="Título para buscadores" htmlFor="ps-seo" hint={`${seoTitle.length}/70 · si lo dejas vacío se usa el título`} error={errors.seo_title}>
          <Input id="ps-seo" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} />
        </Field>
        <Field label="Descripción para buscadores" htmlFor="ps-desc" hint={`${seoDesc.length}/170`} error={errors.seo_description}>
          <Textarea id="ps-desc" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} maxLength={170} rows={3} />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-bold text-stone-800">Imagen al compartir en redes</p>
          <MediaField value={og} onChange={setOg} label="Imagen para redes" />
        </div>
      </div>
    </Dialog>
  );
}
