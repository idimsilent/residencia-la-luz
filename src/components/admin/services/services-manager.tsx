"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteService, reorderServices, setServiceStatus } from "@/features/services/actions";
import { Icon } from "@/components/public/icon";
import { SortableList } from "../sortable-list";
import { Badge, EmptyState, useAdminHref, useConfirm, useToast } from "../ui";

export type ServiceRow = { id: string; title: string; summary: string; icon: string; status: "draft" | "published"; is_demo: boolean };

export function ServicesManager({ initial }: { initial: ServiceRow[] }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", res.message ?? "Hecho.");
        after?.();
        router.refresh();
      } else toast("error", res.error ?? "Error");
    });

  if (!items.length) return <EmptyState title="Todavía no hay servicios">Crea el primero con el botón «Nuevo servicio».</EmptyState>;

  return (
    <div>
      <p className="mb-3 text-sm text-stone-600">Arrastra para cambiar el orden en que aparecen en la web.</p>
      <SortableList
        items={items}
        label="Servicio"
        onReorder={(next) => {
          const prev = items;
          setItems(next);
          startTransition(async () => {
            const res = await reorderServices(next.map((s) => s.id));
            if (!res.ok) {
              setItems(prev);
              toast("error", res.error);
            } else toast("success", res.message ?? "Orden guardado.");
          });
        }}
        className="space-y-2"
        itemClassName="rounded-2xl border border-stone-200 bg-white px-3 py-3"
        renderItem={(s) => (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Link href={href(`/servicios/${s.id}`)} prefetch={false} className="font-bold text-stone-900 hover:text-sage-700">
                {s.title}
              </Link>
              <p className="line-clamp-1 text-xs text-stone-500">{s.summary}</p>
            </div>
            <div className="hidden gap-1 sm:flex">
              {s.status === "draft" ? <Badge tone="warning">Oculto</Badge> : <Badge tone="success">Visible</Badge>}
              {s.is_demo ? <Badge>Demo</Badge> : null}
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setServiceStatus({ id: s.id, status: s.status === "draft" ? "published" : "draft" }),
                  () => setItems((list) => list.map((x) => (x.id === s.id ? { ...x, status: x.status === "draft" ? "published" : "draft" } : x))),
                )
              }
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
              aria-label={s.status === "draft" ? `Mostrar «${s.title}» en la web` : `Ocultar «${s.title}» de la web`}
              title={s.status === "draft" ? "Mostrar en la web" : "Ocultar de la web"}
            >
              {s.status === "draft" ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
            </button>
            <Link href={href(`/servicios/${s.id}`)} prefetch={false} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={`Editar «${s.title}»`} title="Editar">
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={async () => {
                if (await confirm({ title: "¿Eliminar este servicio?", message: <>«{s.title}» desaparecerá de la web. Si solo quieres ocultarlo temporalmente, usa el icono del ojo.</>, confirmLabel: "Eliminar" }))
                  run(() => deleteService(s.id), () => setItems((list) => list.filter((x) => x.id !== s.id)));
              }}
              className="rounded-lg p-2 text-[#b42318] hover:bg-red-50"
              aria-label={`Eliminar «${s.title}»`}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
