"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Pencil, Send, FileEdit, Trash2 } from "lucide-react";
import { deleteEvents, duplicateEvent, setEventStatus } from "@/features/events/actions";
import { Badge, EmptyState, useAdminHref, useConfirm, useToast } from "../ui";

export type EventListRow = { id: string; title: string; when: string; status: "draft" | "published"; category: string | null; color: string | null; is_demo: boolean };

export function EventList({ rows }: { rows: EventListRow[] }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", res.message ?? "Hecho.");
        router.refresh();
      } else toast("error", res.error ?? "Error");
    });

  if (!rows.length) return <EmptyState title="No hay eventos próximos">Haz clic en un día del calendario para crear uno.</EmptyState>;

  return (
    <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3 px-4 py-3">
          <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ background: r.color ?? "#5f7d63" }} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Link href={href(`/eventos/${r.id}`)} prefetch={false} className="font-bold text-stone-900 hover:text-sage-700">
              {r.title}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="first-letter:uppercase">{r.when}</span>
              {r.status === "draft" ? <Badge tone="warning">Borrador</Badge> : null}
              {r.is_demo ? <Badge>Demo</Badge> : null}
              {r.category ? <span>{r.category}</span> : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Link href={href(`/eventos/${r.id}`)} prefetch={false} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={`Editar «${r.title}»`} title="Editar">
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setEventStatus({ ids: [r.id], status: r.status === "draft" ? "published" : "draft" }))}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
              aria-label={r.status === "draft" ? `Publicar «${r.title}»` : `Pasar «${r.title}» a borrador`}
              title={r.status === "draft" ? "Publicar" : "Pasar a borrador"}
            >
              {r.status === "draft" ? <Send className="h-4 w-4" aria-hidden="true" /> : <FileEdit className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button type="button" disabled={pending} onClick={() => run(() => duplicateEvent(r.id))} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={`Duplicar «${r.title}»`} title="Duplicar">
              <Copy className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={async () => {
                if (await confirm({ title: "¿Eliminar este evento?", message: <>«{r.title}» se borrará definitivamente.</>, confirmLabel: "Eliminar" })) run(() => deleteEvents([r.id]));
              }}
              className="rounded-lg p-2 text-[#b42318] hover:bg-red-50"
              aria-label={`Eliminar «${r.title}»`}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
