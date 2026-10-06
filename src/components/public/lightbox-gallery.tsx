"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mediaPublicUrl, type MediaLite } from "@/features/media/url";
import { cn } from "@/lib/utils";

export type LightboxItem = { id: string; media: MediaLite; caption: string };

/**
 * Galería responsive con ampliación en modal accesible (<dialog>):
 * navegación con flechas del teclado, botones, Escape para cerrar y
 * devolución del foco a la miniatura.
 */
export function LightboxGallery({
  items,
  columns = 3,
  layout = "grid",
}: {
  items: LightboxItem[];
  columns?: number;
  layout?: "grid" | "mosaic";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);
  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setIndex((current) => {
        if (current !== null) triggerRefs.current[current]?.focus();
        return null;
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKey);
    };
  }, [go]);

  const colClass =
    columns >= 4 ? "lg:grid-cols-4" : columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
  const current = index !== null ? items[index] : null;

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4", colClass, layout === "mosaic" && "grid-flow-dense")}>
        {items.map((item, i) => {
          const big = layout === "mosaic" && i % 5 === 0;
          return (
            <li key={item.id} className={cn(big && "col-span-2 row-span-2")}>
              <button
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
                onClick={() => open(i)}
                className="group relative block aspect-[4/3] h-full w-full overflow-hidden rounded-theme bg-surface-alt"
              >
                <Image
                  src={mediaPublicUrl(item.media.storage_path)}
                  alt={item.media.alt_text || item.caption}
                  fill
                  sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  quality={70}
                  unoptimized={item.media.mime_type === "image/svg+xml"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="sr-only">Ampliar imagen{item.caption ? `: ${item.caption}` : ""}</span>
                {item.caption ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {item.caption}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label="Visor de imágenes"
        className="m-auto h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/85"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-10" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <figure className="relative flex max-h-[80vh] w-full max-w-5xl flex-1 items-center justify-center">
              <Image
                key={current.id}
                src={mediaPublicUrl(current.media.storage_path)}
                alt={current.media.alt_text || current.caption}
                fill
                sizes="100vw"
                quality={80}
                unoptimized={current.media.mime_type === "image/svg+xml"}
                className="animate-fade-up object-contain"
              />
            </figure>
            <p className="text-center text-white" aria-live="polite">
              {current.caption || current.media.title}{" "}
              <span className="opacity-70">
                ({(index ?? 0) + 1} de {items.length})
              </span>
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => go(-1)} className="btn btn-ghost-light" aria-label="Imagen anterior">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={close} className="btn btn-light" aria-label="Cerrar visor">
                <X className="h-5 w-5" aria-hidden="true" /> Cerrar
              </button>
              <button type="button" onClick={() => go(1)} className="btn btn-ghost-light" aria-label="Imagen siguiente">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
