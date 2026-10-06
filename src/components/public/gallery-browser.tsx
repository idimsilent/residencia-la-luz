"use client";

import { useState } from "react";
import { LightboxGallery, type LightboxItem } from "./lightbox-gallery";
import { cn } from "@/lib/utils";

/** Galería filtrable por categorías (filtro en cliente, sin recargar). */
export function GalleryBrowser({
  categories,
  items,
  layout,
}: {
  categories: { id: string; name: string }[];
  items: (LightboxItem & { categoryId: string | null })[];
  layout: "grid" | "mosaic";
}) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? items.filter((i) => i.categoryId === active) : items;
  const used = categories.filter((c) => items.some((i) => i.categoryId === c.id));
  return (
    <div>
      {used.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar fotografías por categoría">
          {[{ id: null as string | null, name: "Todas" }, ...used].map((c) => (
            <button
              key={c.id ?? "all"}
              type="button"
              aria-pressed={active === c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition",
                active === c.id ? "border-primary bg-primary text-primary-contrast" : "border-line hover:border-primary",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {visible.length} fotografías
      </p>
      <LightboxGallery key={active ?? "all"} items={visible} columns={3} layout={layout} />
    </div>
  );
}
