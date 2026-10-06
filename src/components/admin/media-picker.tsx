"use client";

/* eslint-disable @next/next/no-img-element -- miniaturas del panel sin optimizar a propósito */
import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { GripVertical, ImagePlus, Loader2, Search, Trash2, Upload, X } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { listMedia, type MediaItem } from "@/features/media/actions";
import { mediaPublicUrl, type MediaLite } from "@/features/media/url";
import { uploadImage } from "./upload";
import { Button, Dialog, Input, useToast } from "./ui";
import { cn } from "@/lib/utils";

export function Thumb({ media, className }: { media: MediaLite; className?: string }) {
  return (
    <img
      src={mediaPublicUrl(media.storage_path)}
      alt={media.alt_text}
      loading="lazy"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

/** Zona de subida: arrastrar y soltar o seleccionar archivos. */
export function UploadDropzone({ onUploaded, multiple = true, compact = false }: { onUploaded: (m: MediaLite[]) => void; multiple?: boolean; compact?: boolean }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [over, setOver] = useState(false);

  const handle = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).slice(0, 20);
      if (!list.length) return;
      setBusy({ done: 0, total: list.length });
      const ok: MediaLite[] = [];
      for (const f of list) {
        try {
          ok.push(await uploadImage(f));
        } catch (e) {
          toast("error", `${f.name}: ${e instanceof Error ? e.message : "error al subir"}`);
        }
        setBusy((b) => (b ? { ...b, done: b.done + 1 } : b));
      }
      setBusy(null);
      if (ok.length) {
        toast("success", ok.length === 1 ? "Imagen subida." : `${ok.length} imágenes subidas.`);
        onUploaded(ok);
      }
    },
    [onUploaded, toast],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void handle(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition",
        over ? "border-sage-500 bg-sage-50" : "border-stone-300 bg-stone-50",
        compact ? "p-4" : "p-8",
      )}
    >
      {busy ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-stone-700" role="status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Subiendo {busy.done}/{busy.total}…
        </p>
      ) : (
        <>
          <Upload className="h-6 w-6 text-stone-400" aria-hidden="true" />
          <p className="text-sm text-stone-600">
            Arrastra aquí tus fotos o{" "}
            <button type="button" className="font-bold text-sage-700 underline" onClick={() => inputRef.current?.click()}>
              selecciónalas
            </button>
          </p>
          <p className="text-xs text-stone-500">JPG, PNG, WebP o AVIF · máx. 8 MB · se optimizan automáticamente</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files) void handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Diálogo para elegir imágenes de la biblioteca (o subir nuevas). */
export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
  title = "Elegir imagen",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaLite[]) => void;
  multiple?: boolean;
  title?: string;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaLite[]>([]);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const load = useCallback(
    (term: string) =>
      startTransition(async () => {
        const res = await listMedia({ search: term || undefined });
        if (res.ok && res.data) setItems(res.data.items);
        else if (!res.ok) toast("error", res.error);
      }),
    [toast],
  );

  useEffect(() => {
    if (open) load("");
  }, [open, load]);

  // La selección se vacía al cerrar para que el diálogo empiece limpio la próxima vez.
  const close = () => {
    setSelected([]);
    onClose();
  };

  const toggle = (m: MediaLite) => {
    if (!multiple) {
      setSelected([m]);
      return;
    }
    setSelected((s) => (s.some((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]));
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      size="xl"
      footer={
        <>
          <span className="mr-auto self-center text-sm text-stone-600">{selected.length ? `${selected.length} seleccionada(s)` : "Haz clic en una imagen para seleccionarla"}</span>
          <Button variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            disabled={!selected.length}
            onClick={() => {
              onSelect(selected);
              close();
            }}
          >
            Usar {multiple && selected.length > 1 ? "imágenes" : "imagen"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div>
          <form
            role="search"
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              load(search);
            }}
          >
            <label htmlFor="media-search" className="sr-only">
              Buscar imágenes
            </label>
            <Input id="media-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o descripción…" />
            <Button type="submit" variant="secondary" aria-label="Buscar">
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
          {pending && !items.length ? (
            <p className="py-10 text-center text-sm text-stone-500">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">No hay imágenes. Sube la primera desde el panel lateral.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {items.map((m) => {
                const isSel = selected.some((s) => s.id === m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      onDoubleClick={() => {
                        if (!multiple) {
                          onSelect([m]);
                          close();
                        }
                      }}
                      aria-pressed={isSel}
                      className={cn(
                        "group relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-stone-100",
                        isSel ? "border-sage-600 ring-2 ring-sage-300" : "border-transparent hover:border-stone-300",
                      )}
                      title={m.title}
                    >
                      <Thumb media={m} />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1.5 py-0.5 text-left text-[0.7rem] text-white">{m.title || m.file_name}</span>
                      {isSel ? <span className="absolute right-1.5 top-1.5 rounded-full bg-sage-600 px-1.5 text-xs font-bold text-white">✓</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div>
          <UploadDropzone
            compact
            multiple={multiple}
            onUploaded={(uploaded) => {
              setItems((prev) => [
                ...uploaded.map((m) => ({ ...m, file_name: m.title, description: "", tags: [], size_bytes: 0, created_at: new Date().toISOString(), usage: 0 })),
                ...prev,
              ]);
              setSelected((s) => (multiple ? [...s, ...uploaded] : uploaded.slice(0, 1)));
            }}
          />
          <p className="mt-3 text-xs text-stone-500">
            Recuerda: no subas fotos en las que se reconozca a residentes sin su autorización por escrito. Añade siempre un texto
            alternativo desde la biblioteca.
          </p>
        </div>
      </div>
    </Dialog>
  );
}

/** Campo de formulario para una sola imagen. */
export function MediaField({
  value,
  onChange,
  label = "Imagen",
  aspect = "aspect-video",
}: {
  value: MediaLite | null;
  onChange: (m: MediaLite | null) => void;
  label?: string;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
          <div className={cn("w-full", aspect)}>
            <Thumb media={value} />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-stone-200 bg-white px-3 py-2">
            <span className="truncate text-xs text-stone-600" title={value.alt_text}>
              {value.alt_text ? `Alt: ${value.alt_text}` : "⚠ Sin texto alternativo"}
            </span>
            <span className="flex shrink-0 gap-1">
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                Cambiar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange(null)} aria-label={`Quitar ${label.toLowerCase()}`}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-sm font-semibold text-stone-600 hover:border-sage-400 hover:bg-sage-50", aspect)}
        >
          <ImagePlus className="h-6 w-6" aria-hidden="true" /> Elegir {label.toLowerCase()}
        </button>
      )}
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(items) => onChange(items[0] ?? null)} title={`Elegir ${label.toLowerCase()}`} />
    </div>
  );
}

function SortableThumb({ media, onRemove }: { media: MediaLite; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("relative aspect-square overflow-hidden rounded-lg bg-stone-100", isDragging && "z-10 opacity-80 shadow-lg")}>
      <Thumb media={media} />
      <button type="button" {...attributes} {...listeners} className="absolute left-1 top-1 cursor-grab rounded bg-white/90 p-1 text-stone-700" aria-label={`Reordenar ${media.title}`}>
        <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-700" aria-label={`Quitar ${media.title}`}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Campo para varias imágenes ordenables (arrastrar y soltar o teclado). */
export function MediaListField({ value, onChange, max = 24 }: { value: MediaLite[]; onChange: (m: MediaLite[]) => void; max?: number }) {
  const [open, setOpen] = useState(false);
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = value.findIndex((m) => m.id === e.active.id);
    const to = value.findIndex((m) => m.id === e.over!.id);
    onChange(arrayMove(value, from, to));
  };
  return (
    <div>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((m) => m.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((m) => (
              <SortableThumb key={m.id} media={m} onRemove={() => onChange(value.filter((x) => x.id !== m.id))} />
            ))}
            {value.length < max ? (
              <li>
                <button type="button" onClick={() => setOpen(true)} className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-300 text-xs font-semibold text-stone-600 hover:border-sage-400 hover:bg-sage-50">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" /> Añadir
                </button>
              </li>
            ) : null}
          </ul>
        </SortableContext>
      </DndContext>
      <MediaPickerDialog
        open={open}
        multiple
        onClose={() => setOpen(false)}
        title="Añadir fotografías"
        onSelect={(items) => {
          const ids = new Set(value.map((v) => v.id));
          onChange([...value, ...items.filter((i) => !ids.has(i.id))].slice(0, max));
        }}
      />
    </div>
  );
}
