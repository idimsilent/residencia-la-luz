"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";
import { addToGallery, removeFromGallery, reorderGallery, updateGalleryItem } from "@/features/gallery/actions";
import type { MediaLite } from "@/features/media/url";
import { MediaPickerDialog, Thumb } from "../media-picker";
import { SortableList } from "../sortable-list";
import { Button, EmptyState, useConfirm, useToast } from "../ui";
import { cn } from "@/lib/utils";

export type GalleryRow = { id: string; caption: string; category_id: string | null; is_visible: boolean; media: MediaLite };

export function GalleryManager({ initial, categories }: { initial: GalleryRow[]; categories: { id: string; name: string }[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();

  const patch = (id: string, change: Partial<GalleryRow>) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next = { ...item, ...change };
    setItems((list) => list.map((i) => (i.id === id ? next : i)));
    startTransition(async () => {
      const res = await updateGalleryItem({ id, caption: next.caption, category_id: next.category_id, is_visible: next.is_visible });
      if (!res.ok) {
        toast("error", res.error);
        setItems((list) => list.map((i) => (i.id === id ? item : i)));
      }
    });
  };

  const visible = filter ? items.filter((i) => (filter === "none" ? !i.category_id : i.category_id === filter)) : items;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button onClick={() => setPickerOpen(true)}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> Añadir imágenes
        </Button>
        <label className="ml-auto text-sm font-bold text-stone-700">
          <span className="sr-only">Filtrar por categoría</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input w-56">
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="none">Sin categoría</option>
          </select>
        </label>
      </div>
      <p className="mb-3 text-sm text-stone-600">
        Arrastra para ordenar. Los cambios en los textos se guardan al salir del campo.
        {filter ? " (Para reordenar, quita el filtro.)" : ""}
      </p>
      {!visible.length ? (
        <EmptyState title="La galería está vacía">Añade imágenes de la biblioteca con el botón de arriba.</EmptyState>
      ) : (
        <SortableList
          items={visible}
          label="Imagen"
          onReorder={(next) => {
            if (filter) return;
            const prev = items;
            setItems(next);
            startTransition(async () => {
              const res = await reorderGallery(next.map((i) => i.id));
              if (!res.ok) {
                setItems(prev);
                toast("error", res.error);
              }
            });
          }}
          className="space-y-2"
          itemClassName="rounded-2xl border border-stone-200 bg-white p-2"
          renderItem={(g) => (
            <div className={cn("flex flex-wrap items-center gap-3", !g.is_visible && "opacity-60")}>
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <Thumb media={g.media} />
              </div>
              <label className="min-w-48 flex-1">
                <span className="sr-only">Pie de foto</span>
                <input
                  defaultValue={g.caption}
                  placeholder={g.media.alt_text || "Pie de foto (opcional)"}
                  maxLength={300}
                  className="admin-input"
                  onBlur={(e) => {
                    if (e.target.value !== g.caption) patch(g.id, { caption: e.target.value });
                  }}
                />
              </label>
              <label>
                <span className="sr-only">Categoría</span>
                <select value={g.category_id ?? ""} onChange={(e) => patch(g.id, { category_id: e.target.value || null })} className="admin-input w-44">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => patch(g.id, { is_visible: !g.is_visible })}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                aria-label={g.is_visible ? "Ocultar de la galería pública" : "Mostrar en la galería pública"}
                title={g.is_visible ? "Ocultar" : "Mostrar"}
              >
                {g.is_visible ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!(await confirm({ title: "¿Quitar de la galería?", message: "La imagen seguirá en la biblioteca.", confirmLabel: "Quitar" }))) return;
                  startTransition(async () => {
                    const res = await removeFromGallery(g.id);
                    if (!res.ok) return toast("error", res.error);
                    setItems((list) => list.filter((i) => i.id !== g.id));
                    toast("success", res.message ?? "Quitada.");
                  });
                }}
                className="rounded-lg p-2 text-[#b42318] hover:bg-red-50"
                aria-label="Quitar de la galería"
                title="Quitar de la galería"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      )}
      <MediaPickerDialog
        open={pickerOpen}
        multiple
        onClose={() => setPickerOpen(false)}
        title="Añadir a la galería pública"
        onSelect={(list) =>
          startTransition(async () => {
            if (!list.length) return;
            const res = await addToGallery({ mediaIds: list.map((m) => m.id), categoryId: filter && filter !== "none" ? filter : null });
            toast(res.ok ? "success" : "error", res.ok ? res.message ?? "Añadidas." : res.error);
            router.refresh();
          })
        }
      />
    </div>
  );
}
