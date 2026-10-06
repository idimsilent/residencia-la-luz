"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { activateTheme, deleteTheme, duplicateTheme } from "@/features/theme/actions";
import { Badge, Button, useAdminHref, useConfirm, useToast } from "../ui";
import { cn } from "@/lib/utils";

export type ThemeCard = { id: string; name: string; isActive: boolean; isPreset: boolean; hasDraft: boolean; swatches: string[]; headingFont: string };

export function ThemesList({ themes }: { themes: ThemeCard[] }) {
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
      if (go && res.data) router.push(href(`/apariencia/${res.data.id}`));
      else router.refresh();
    });

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {themes.map((t) => (
        <li key={t.id} className={cn("overflow-hidden rounded-2xl border bg-white shadow-sm", t.isActive ? "border-sage-500 ring-2 ring-sage-200" : "border-stone-200")}>
          <div className="flex h-24" aria-hidden="true">
            {t.swatches.map((c, i) => (
              <span key={i} className="flex-1" style={{ background: c }} />
            ))}
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base text-stone-900">{t.name}</h2>
              {t.isActive ? <Badge tone="success">Aplicado</Badge> : null}
              {t.isPreset ? <Badge>Predefinido</Badge> : null}
              {t.hasDraft ? <Badge tone="info">Borrador</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-stone-500">Títulos: {t.headingFont}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={href(`/apariencia/${t.id}`)} prefetch={false} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-sage-100 px-3 text-sm font-bold text-sage-800 hover:bg-sage-200">
                <Pencil className="h-4 w-4" aria-hidden="true" /> Personalizar
              </Link>
              {!t.isActive ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={async () => {
                    if (await confirm({ title: `¿Aplicar «${t.name}»?`, message: "La web cambiará de aspecto para todas las visitas. Puedes volver al tema anterior en cualquier momento.", confirmLabel: "Aplicar", tone: "primary" }))
                      run(() => activateTheme(t.id));
                  }}
                >
                  <Check className="h-4 w-4" aria-hidden="true" /> Aplicar
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => duplicateTheme(t.id), true)}>
                <Copy className="h-4 w-4" aria-hidden="true" /> Duplicar
              </Button>
              {!t.isActive && !t.isPreset ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#b42318]"
                  disabled={pending}
                  onClick={async () => {
                    if (await confirm({ title: "¿Eliminar el tema?", message: `«${t.name}» se borrará definitivamente.`, confirmLabel: "Eliminar" })) run(() => deleteTheme(t.id));
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                </Button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
