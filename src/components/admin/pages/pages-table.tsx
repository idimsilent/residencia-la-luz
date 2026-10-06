"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, ExternalLink, EyeOff, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { createPage, deletePage, duplicatePage, unpublishPage } from "@/features/pages/actions";
import { Badge, Button, Dialog, Field, Input, useAdminHref, useConfirm, useToast } from "../ui";
import { slugify } from "@/lib/utils";

export type PageRowLite = {
  id: string;
  title: string;
  slug: string;
  is_system: boolean;
  status: "draft" | "published";
  has_unpublished_changes: boolean;
  updated_at: string;
  path: string;
};

export function PagesTable({ rows, isAdmin }: { rows: PageRowLite[]; isAdmin: boolean }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string; data?: { id: string } }>, go = false) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error ?? "Error");
      toast("success", res.message ?? "Hecho.");
      if (go && res.data) router.push(href(`/paginas/${res.data.id}`));
      else router.refresh();
    });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nueva página
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th scope="col" className="px-4 py-3">Página</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <Link href={href(`/paginas/${p.id}`)} prefetch={false} className="font-bold text-stone-900 hover:text-sage-700">
                    {p.title}
                  </Link>
                  <span className="block text-xs text-stone-500">
                    {p.path}
                    {p.is_system ? (
                      <span className="ml-2 inline-flex items-center gap-1" title="Página principal: no se puede borrar">
                        <Lock className="h-3 w-3" aria-hidden="true" /> principal
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    {p.status === "published" ? <Badge tone="success">Publicada</Badge> : <Badge tone="warning">Borrador</Badge>}
                    {p.has_unpublished_changes && p.status === "published" ? <Badge tone="info">Cambios sin publicar</Badge> : null}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex justify-end gap-0.5">
                    <Link href={href(`/paginas/${p.id}`)} prefetch={false} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" title="Editar" aria-label={`Editar «${p.title}»`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    {p.status === "published" ? (
                      <a href={p.path} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" title="Ver en la web" aria-label={`Ver «${p.title}» en la web`}>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : null}
                    <button type="button" disabled={pending} onClick={() => run(() => duplicatePage(p.id), true)} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" title="Duplicar" aria-label={`Duplicar «${p.title}»`}>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {!p.is_system && p.status === "published" ? (
                      <button type="button" disabled={pending} onClick={() => run(() => unpublishPage(p.id))} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" title="Retirar de la web" aria-label={`Retirar «${p.title}» de la web`}>
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                    {!p.is_system && isAdmin ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={async () => {
                          if (await confirm({ title: "¿Eliminar esta página?", message: <>«{p.title}» y todo su historial se borrarán definitivamente. Los enlaces del menú a esta página también se quitarán.</>, confirmLabel: "Eliminar" }))
                            run(() => deletePage(p.id));
                        }}
                        className="rounded-lg p-2 text-[#b42318] hover:bg-red-50"
                        title="Eliminar"
                        aria-label={`Eliminar «${p.title}»`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nueva página"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button loading={pending} onClick={() => run(() => createPage({ title, slug }), true)}>
              Crear y editar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Título" htmlFor="np-title" required>
            <Input
              id="np-title"
              value={title}
              autoFocus
              maxLength={160}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Dirección (URL)" htmlFor="np-slug" hint={`/${slug || "…"}`}>
            <Input
              id="np-slug"
              value={slug}
              maxLength={80}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
            />
          </Field>
          <p className="text-xs text-stone-500">La página se crea como borrador. Cuando la publiques, puedes añadirla al menú desde «Menús y navegación».</p>
        </div>
      </Dialog>
    </div>
  );
}
