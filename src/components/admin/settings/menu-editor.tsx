"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Lock, Plus, Trash2 } from "lucide-react";
import { saveMenu } from "@/features/settings/actions";
import { SortableList } from "../sortable-list";
import { Button, Card, Input, Select, useToast } from "../ui";
import { cn } from "@/lib/utils";

export type MenuRow = { id: string; label: string; href: string; is_visible: boolean; is_system: boolean; open_in_new_tab: boolean };
type Item = MenuRow & { isNew?: boolean };

const TITLES = { header: "Menú principal (cabecera)", footer: "Enlaces del pie", legal: "Enlaces legales" } as const;

export function MenuEditor({ location, initial, pages }: { location: keyof typeof TITLES; initial: MenuRow[]; pages: { title: string; path: string }[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [newPage, setNewPage] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const change = (next: Item[]) => {
    setItems(next);
    setDirty(true);
  };
  const patch = (id: string, p: Partial<Item>) => change(items.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const add = (label: string, href: string) =>
    change([...items, { id: `new-${Date.now()}`, label, href, is_visible: true, is_system: false, open_in_new_tab: false, isNew: true }]);

  const save = () =>
    startTransition(async () => {
      const res = await saveMenu({
        location,
        items: items.map((i) => ({ id: i.isNew ? undefined : i.id, label: i.label, href: i.href, is_visible: i.is_visible, open_in_new_tab: i.open_in_new_tab })),
      });
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("success", res.message ?? "Guardado.");
    });

  return (
    <Card
      title={TITLES[location]}
      actions={
        <Button size="sm" onClick={save} loading={pending} disabled={!dirty}>
          Guardar menú
        </Button>
      }
    >
      <SortableList
        items={items}
        label="Enlace"
        onReorder={change}
        className="space-y-2"
        itemClassName="rounded-xl border border-stone-200 bg-white p-2"
        renderItem={(i) => (
          <div className={cn("flex flex-wrap items-center gap-2", !i.is_visible && "opacity-60")}>
            <label className="min-w-36 flex-1">
              <span className="sr-only">Texto del enlace</span>
              <Input value={i.label} maxLength={60} onChange={(e) => patch(i.id, { label: e.target.value })} />
            </label>
            <label className="min-w-44 flex-1">
              <span className="sr-only">Dirección</span>
              <Input value={i.href} disabled={i.is_system} maxLength={300} onChange={(e) => patch(i.id, { href: e.target.value.trim() })} />
            </label>
            {i.href.startsWith("https://") ? (
              <label className="flex items-center gap-1 text-xs text-stone-600">
                <input type="checkbox" className="accent-sage-600" checked={i.open_in_new_tab} onChange={(e) => patch(i.id, { open_in_new_tab: e.target.checked })} /> Nueva pestaña
              </label>
            ) : null}
            <button type="button" onClick={() => patch(i.id, { is_visible: !i.is_visible })} className="rounded-lg p-2 text-stone-600 hover:bg-stone-100" aria-label={i.is_visible ? "Ocultar enlace" : "Mostrar enlace"} title={i.is_visible ? "Ocultar" : "Mostrar"}>
              {i.is_visible ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
            </button>
            {i.is_system ? (
              <span className="p-2 text-stone-400" title="Enlace principal: se puede ocultar pero no borrar">
                <Lock className="h-4 w-4" aria-label="Enlace principal" />
              </span>
            ) : (
              <button type="button" onClick={() => change(items.filter((x) => x.id !== i.id))} className="rounded-lg p-2 text-[#b42318] hover:bg-red-50" aria-label="Quitar enlace" title="Quitar">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
        <label className="sr-only" htmlFor={`add-${location}`}>
          Añadir una página
        </label>
        <Select id={`add-${location}`} value={newPage} onChange={(e) => setNewPage(e.target.value)} className="w-64">
          <option value="">Elegir una página…</option>
          {pages.map((p) => (
            <option key={p.path} value={p.path}>
              {p.title}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          variant="secondary"
          disabled={!newPage}
          onClick={() => {
            const p = pages.find((x) => x.path === newPage);
            if (p) add(p.title.slice(0, 60), p.path);
            setNewPage("");
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Añadir página
        </Button>
        <Button size="sm" variant="ghost" onClick={() => add("Enlace externo", "https://")}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Enlace externo
        </Button>
      </div>
    </Card>
  );
}
