"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Send, X } from "lucide-react";
import { quickPost } from "@/features/news/actions";
import type { MediaLite } from "@/features/media/url";
import { MediaPickerDialog, Thumb } from "../media-picker";
import { Button, useAdminHref, useToast } from "../ui";

/** Publicación rápida al estilo de una red social: escribe, añade foto y publica. */
export function QuickComposer({ categories, autoFocus }: { categories: { id: string; name: string }[]; autoFocus?: boolean }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaLite | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [last, setLast] = useState<{ id: string; slug: string; published: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const href = useAdminHref();

  useEffect(() => {
    if (autoFocus) titleRef.current?.focus();
  }, [autoFocus]);

  const submit = (publish: boolean) =>
    startTransition(async () => {
      const res = await quickPost({ title, text, media_id: media?.id ?? null, category_id: categoryId || null, publish });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast("error", res.error);
        return;
      }
      toast("success", res.message ?? "Guardado.");
      setLast(res.data ? { ...res.data, published: publish } : null);
      setTitle("");
      setText("");
      setMedia(null);
      setErrors({});
      router.refresh();
    });

  const remaining = 5000 - text.length;

  return (
    <section aria-labelledby="quick-title" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 id="quick-title" className="mb-3 text-base text-stone-900">
        Publicación rápida
      </h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="quick-headline" className="sr-only">
            Título
          </label>
          <input
            id="quick-headline"
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué ha pasado hoy en el centro? (título)"
            maxLength={200}
            className="admin-input text-base font-bold"
            aria-invalid={Boolean(errors.title) || undefined}
            aria-describedby={errors.title ? "quick-headline-err" : undefined}
          />
          {errors.title ? (
            <p id="quick-headline-err" className="mt-1 text-xs font-bold text-[#b42318]" role="alert">
              {errors.title[0]}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="quick-text" className="sr-only">
            Texto
          </label>
          <textarea
            id="quick-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cuéntalo en unas líneas. Deja una línea en blanco para separar párrafos."
            maxLength={5000}
            rows={3}
            className="admin-input min-h-24 resize-y"
          />
          {remaining < 400 ? <p className="mt-1 text-right text-xs text-stone-500">Quedan {remaining} caracteres</p> : null}
        </div>
        {media ? (
          <div className="relative w-48 overflow-hidden rounded-xl border border-stone-200">
            <div className="aspect-video">
              <Thumb media={media} />
            </div>
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-stone-700 shadow hover:bg-white"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
          <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> {media ? "Cambiar foto" : "Añadir foto"}
          </Button>
          <label className="sr-only" htmlFor="quick-category">
            Categoría
          </label>
          <select id="quick-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="admin-input !min-h-8 h-8 !w-auto py-0 text-sm">
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" loading={pending} onClick={() => submit(false)}>
              Guardar borrador
            </Button>
            <Button size="sm" loading={pending} onClick={() => submit(true)}>
              <Send className="h-4 w-4" aria-hidden="true" /> Publicar
            </Button>
          </span>
        </div>
        {last ? (
          <p className="rounded-lg bg-sage-50 px-3 py-2 text-sm text-sage-900" role="status">
            {last.published ? "Publicada." : "Borrador guardado."}{" "}
            <Link href={href(`/noticias/${last.id}`)} className="font-bold underline" prefetch={false}>
              Editar con más detalle
            </Link>
            {last.published ? (
              <>
                {" · "}
                <a href={`/noticias/${last.slug}`} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                  Ver en la web
                </a>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      <MediaPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={([m]) => setMedia(m ?? null)} title="Foto de la publicación" />
    </section>
  );
}
