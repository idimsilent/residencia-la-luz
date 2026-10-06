"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AlertTriangle, ImagePlus, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { deleteMedia, getMediaUsage, listMedia, replaceMedia, updateMedia, type MediaItem, type MediaUsage } from "@/features/media/actions";
import { addToGallery } from "@/features/gallery/actions";
import { mediaPublicUrl } from "@/features/media/url";
import { MediaPickerDialog, Thumb, UploadDropzone } from "../media-picker";
import { Badge, Button, Dialog, EmptyState, Field, Input, Notice, Textarea, useConfirm, useToast } from "../ui";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<string, string> = {
  news: "Noticia",
  event: "Evento",
  service: "Servicio",
  gallery: "Galería pública",
  page: "Página",
  settings: "Configuración del centro",
};

function formatBytes(n: number) {
  return n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`;
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const toast = useToast();

  const load = useCallback(
    async (opts?: { page?: number }) => {
      setLoading(true);
      const p = opts?.page ?? 1;
      const res = await listMedia({ search: search || undefined, tag: tag || undefined, page: p });
      setLoading(false);
      if (!res.ok) return toast("error", res.error);
      setItems((prev) => (p > 1 ? [...prev, ...(res.data?.items ?? [])] : res.data?.items ?? []));
      setTotal(res.data?.total ?? 0);
      setTags(res.data?.tags ?? []);
      setPage(p);
    },
    [search, tag, toast],
  );

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <UploadDropzone onUploaded={() => void load()} />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Buscar imágenes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título, archivo o descripción…" className="admin-input pl-9" />
        </label>
        {tags.length ? (
          <label>
            <span className="sr-only">Etiqueta</span>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="admin-input w-48">
              <option value="">Todas las etiquetas</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <p className="text-sm text-stone-500" aria-live="polite">
          {loading ? "Cargando…" : `${total} ${total === 1 ? "imagen" : "imágenes"}`}
        </p>
      </div>

      {!loading && !items.length ? (
        <div className="mt-6">
          <EmptyState title="No hay imágenes">Sube fotografías arrastrándolas a la zona de arriba.</EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setSelected(m)}
                className="group block w-full overflow-hidden rounded-xl border border-stone-200 bg-white text-left shadow-sm transition hover:border-sage-400 hover:shadow-md"
              >
                <span className="relative block aspect-[4/3] bg-stone-100">
                  <Thumb media={m} />
                  {!m.alt_text ? (
                    <span className="absolute left-2 top-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">Sin texto alternativo</span>
                  ) : null}
                </span>
                <span className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="truncate text-xs font-bold text-stone-800">{m.title || m.file_name}</span>
                  <span className={cn("shrink-0 rounded-full px-1.5 text-[11px] font-bold", m.usage ? "bg-sage-100 text-sage-800" : "bg-stone-100 text-stone-500")}>
                    {m.usage ? `En uso (${m.usage})` : "Sin usar"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length < total ? (
        <div className="mt-4 text-center">
          <Button variant="secondary" loading={loading} onClick={() => void load({ page: page + 1 })}>
            Cargar más
          </Button>
        </div>
      ) : null}

      {selected ? (
        <MediaDetail
          media={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}

function MediaDetail({ media, onClose, onChanged }: { media: MediaItem; onClose: () => void; onChanged: () => void }) {
  const [title, setTitle] = useState(media.title);
  const [alt, setAlt] = useState(media.alt_text);
  const [description, setDescription] = useState(media.description);
  const [tagText, setTagText] = useState(media.tags.join(", "));
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    void getMediaUsage(media.id).then((r) => setUsage(r.ok ? r.data ?? [] : []));
  }, [media.id]);

  const save = () =>
    startTransition(async () => {
      const tags = tagText.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const res = await updateMedia({ id: media.id, title, alt_text: alt, description, tags });
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Guardado.");
      onChanged();
    });

  const remove = async () => {
    const inUse = (usage?.length ?? 0) > 0;
    const ok = await confirm({
      title: inUse ? "Esta imagen se está usando" : "¿Eliminar la imagen?",
      message: inUse ? (
        <>
          <p>Aparece en {usage!.length} {usage!.length === 1 ? "sitio" : "sitios"}. Si la borras, esos huecos quedarán sin imagen.</p>
          <p className="mt-2">Te recomendamos usar «Sustituir por otra» en su lugar.</p>
        </>
      ) : (
        "Se borrará definitivamente de la biblioteca."
      ),
      confirmLabel: inUse ? "Eliminar de todos modos" : "Eliminar",
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteMedia({ id: media.id, force: inUse });
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Eliminada.");
      onChanged();
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Detalles de la imagen"
      size="lg"
      footer={
        <>
          <Button variant="ghost" className="mr-auto text-[#b42318]" onClick={remove} disabled={pending}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={save} loading={pending}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <a href={mediaPublicUrl(media.storage_path)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <Thumb media={media} className="max-h-80 object-contain" />
          </a>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-stone-600">
            <dt className="font-bold">Archivo</dt>
            <dd className="truncate">{media.file_name}</dd>
            <dt className="font-bold">Tamaño</dt>
            <dd>
              {formatBytes(media.size_bytes)}
              {media.width && media.height ? ` · ${media.width}×${media.height}px` : ""}
            </dd>
          </dl>
          {media.is_demo ? <div className="mt-2"><Badge>Imagen de demostración</Badge></div> : null}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-stone-800">Dónde se usa</h3>
            {usage === null ? (
              <Loader2 className="mt-2 h-4 w-4 animate-spin text-stone-400" aria-label="Cargando" />
            ) : usage.length ? (
              <ul className="mt-1 space-y-1 text-sm text-stone-700">
                {usage.map((u, i) => (
                  <li key={i}>
                    <span className="text-stone-500">{KIND_LABELS[u.kind] ?? u.kind}:</span> {u.ref_title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-stone-500">No se usa en ningún sitio.</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setReplaceOpen(true)}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Sustituir por otra
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                startTransition(async () => {
                  const res = await addToGallery({ mediaIds: [media.id], categoryId: null });
                  toast(res.ok ? "success" : "error", res.ok ? res.message ?? "Añadida." : res.error);
                })
              }
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" /> Añadir a la galería
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {!alt ? (
            <Notice tone="warning">
              <span className="inline-flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Añade un texto alternativo: lo leen las personas que usan lectores de pantalla.
              </span>
            </Notice>
          ) : null}
          <Field label="Título" htmlFor="md-title">
            <Input id="md-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
          </Field>
          <Field label="Texto alternativo" htmlFor="md-alt" hint="Describe lo que se ve, en una frase. Ej.: «Jardín con bancos a la sombra de los árboles»." >
            <Textarea id="md-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} rows={2} />
          </Field>
          <Field label="Descripción interna" htmlFor="md-desc" hint="Solo se ve en el panel.">
            <Textarea id="md-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={2} />
          </Field>
          <Field label="Etiquetas" htmlFor="md-tags" hint="Separadas por comas. Ej.: jardín, actividades">
            <Input id="md-tags" value={tagText} onChange={(e) => setTagText(e.target.value)} />
          </Field>
        </div>
      </div>
      <MediaPickerDialog
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Elige la imagen que la sustituirá"
        onSelect={async ([to]) => {
          if (!to || to.id === media.id) return;
          const res = await replaceMedia({ fromId: media.id, toId: to.id });
          if (!res.ok) return toast("error", res.error);
          toast("success", res.message ?? "Sustituida.");
          const del = await confirm({
            title: "¿Borrar la imagen antigua?",
            message: "Ya no se usa en ningún sitio. Puedes borrarla o conservarla en la biblioteca.",
            confirmLabel: "Borrar la antigua",
          });
          if (del) {
            const r = await deleteMedia({ id: media.id, force: true });
            toast(r.ok ? "success" : "error", r.ok ? r.message ?? "Eliminada." : r.error);
          }
          onChanged();
        }}
      />
    </Dialog>
  );
}
