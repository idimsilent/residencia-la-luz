"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, Copy, ExternalLink, FileEdit, Pencil, Send, Star, Trash2 } from "lucide-react";
import { deleteNews, duplicateNews, setNewsStatus } from "@/features/news/actions";
import type { MediaLite } from "@/features/media/url";
import { Thumb } from "../media-picker";
import { Badge, Button, EmptyState, useAdminHref, useConfirm, useToast } from "../ui";
import { formatDateTime } from "@/lib/dates";

export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
  is_featured: boolean;
  is_demo: boolean;
  category: string | null;
  featured: MediaLite | null;
};

export function newsStatus(status: NewsRow["status"], publishedAt: string | null) {
  if (status === "draft") return { label: "Borrador", tone: "warning" as const };
  if (status === "archived") return { label: "Archivada", tone: "neutral" as const };
  if (publishedAt && new Date(publishedAt) > new Date()) return { label: "Programada", tone: "info" as const };
  return { label: "Publicada", tone: "success" as const };
}

export function NewsTable({ rows }: { rows: NewsRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const href = useAdminHref();

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>, clear = true) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast("success", res.message ?? "Hecho.");
        if (clear) setSelected(new Set());
        router.refresh();
      } else toast("error", res.error ?? "Error");
    });

  const ids = [...selected];

  const bulkDelete = async () => {
    const ok = await confirm({
      title: `¿Eliminar ${ids.length} ${ids.length === 1 ? "noticia" : "noticias"}?`,
      message: "Se borrarán definitivamente. Si solo quieres ocultarlas, usa «Archivar».",
      confirmLabel: "Eliminar",
    });
    if (ok) run(() => deleteNews(ids));
  };

  const deleteOne = async (r: NewsRow) => {
    const ok = await confirm({ title: "¿Eliminar esta noticia?", message: <>«{r.title}» se borrará definitivamente.</>, confirmLabel: "Eliminar" });
    if (ok) run(() => deleteNews([r.id]), false);
  };

  if (!rows.length) {
    return (
      <EmptyState title="No hay noticias con estos filtros">
        Prueba a quitar filtros o escribe tu primera publicación arriba.
      </EmptyState>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-2">
        <label className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-sage-600"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
          />
          {selected.size ? `${selected.size} seleccionadas` : "Seleccionar todo"}
        </label>
        {selected.size ? (
          <div className="ml-auto flex flex-wrap gap-2" role="group" aria-label="Acciones para la selección">
            <Button size="sm" variant="secondary" loading={pending} onClick={() => run(() => setNewsStatus({ ids, status: "published" }))}>
              <Send className="h-4 w-4" aria-hidden="true" /> Publicar
            </Button>
            <Button size="sm" variant="secondary" loading={pending} onClick={() => run(() => setNewsStatus({ ids, status: "draft" }))}>
              <FileEdit className="h-4 w-4" aria-hidden="true" /> A borrador
            </Button>
            <Button size="sm" variant="secondary" loading={pending} onClick={() => run(() => setNewsStatus({ ids, status: "archived" }))}>
              <Archive className="h-4 w-4" aria-hidden="true" /> Archivar
            </Button>
            <Button size="sm" variant="danger" loading={pending} onClick={bulkDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
            </Button>
          </div>
        ) : null}
      </div>
      <ul className="divide-y divide-stone-100">
        {rows.map((r) => {
          const st = newsStatus(r.status, r.published_at);
          const isLive = st.label === "Publicada";
          return (
            <li key={r.id} className={`flex items-center gap-3 px-4 py-3 ${selected.has(r.id) ? "bg-sage-50" : ""}`}>
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-sage-600"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                aria-label={`Seleccionar «${r.title}»`}
              />
              <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:block">
                {r.featured ? <Thumb media={r.featured} /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={href(`/noticias/${r.id}`)} prefetch={false} className="line-clamp-2 font-bold text-stone-900 hover:text-sage-700">
                  {r.is_featured ? <Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-500" aria-label="Destacada" /> : null}
                  {r.title}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  {r.is_demo ? <Badge>Demo</Badge> : null}
                  {r.category ? <span>{r.category}</span> : null}
                  <span>
                    {r.published_at ? (st.label === "Programada" ? `Se publicará el ${formatDateTime(r.published_at)}` : formatDateTime(r.published_at)) : `Editada ${formatDateTime(r.updated_at)}`}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Link href={href(`/noticias/${r.id}`)} prefetch={false} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={`Editar «${r.title}»`} title="Editar">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button type="button" disabled={pending} onClick={() => run(() => duplicateNews(r.id), false)} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={`Duplicar «${r.title}»`} title="Duplicar">
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </button>
                {isLive ? (
                  <a href={`/noticias/${r.slug}`} target="_blank" rel="noopener noreferrer" className="hidden rounded-lg p-2 text-stone-600 hover:bg-stone-100 sm:inline-flex" aria-label={`Ver «${r.title}» en la web`} title="Ver en la web">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                <button type="button" disabled={pending} onClick={() => deleteOne(r)} className="rounded-lg p-2 text-[#b42318] hover:bg-red-50" aria-label={`Eliminar «${r.title}»`} title="Eliminar">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
