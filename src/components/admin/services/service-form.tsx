"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { saveService } from "@/features/services/actions";
import type { MediaLite } from "@/features/media/url";
import { ICONS, Icon } from "@/components/public/icon";
import { RichTextEditor } from "../rich-text-editor";
import { MediaField } from "../media-picker";
import { Button, Card, Field, Input, Textarea, useAdminHref, useToast } from "../ui";
import { cn, slugify } from "@/lib/utils";

export type ServiceFormInitial = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  icon: string;
  media: MediaLite | null;
  status: "draft" | "published";
};

export function ServiceForm({ initial }: { initial: ServiceFormInitial }) {
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const href = useAdminHref();
  const set = <K extends keyof ServiceFormInitial>(k: K, val: ServiceFormInitial[K]) =>
    setV((s) => ({ ...s, [k]: val, ...(k === "title" && !slugTouched ? { slug: slugify(String(val)) } : {}) }));

  const save = (status: "draft" | "published") =>
    startTransition(async () => {
      const res = await saveService({ id: v.id, title: v.title, slug: v.slug, summary: v.summary, content_html: v.content_html, icon: v.icon, media_id: v.media?.id ?? null, status });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast("error", res.error);
        return;
      }
      setErrors({});
      toast("success", res.message ?? "Guardado.");
      setV((s) => ({ ...s, status, id: res.data?.id ?? s.id, slug: res.data?.slug ?? s.slug }));
      if (!v.id && res.data) router.replace(href(`/servicios/${res.data.id}`));
      else router.refresh();
    });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={href("/servicios")} prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Servicios
        </Link>
        <h1 className="text-xl text-stone-900">{initial.id ? "Editar servicio" : "Nuevo servicio"}</h1>
        <span className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => save("draft")} loading={pending}>
            Guardar oculto
          </Button>
          <Button onClick={() => save("published")} loading={pending}>
            Guardar y mostrar
          </Button>
        </span>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Card>
          <div className="space-y-4">
            <Field label="Nombre del servicio" htmlFor="s-title" required error={errors.title}>
              <Input id="s-title" value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
            </Field>
            <Field label="Resumen" htmlFor="s-sum" hint="Se muestra en la tarjeta del servicio." error={errors.summary}>
              <Textarea id="s-sum" value={v.summary} onChange={(e) => set("summary", e.target.value)} maxLength={400} rows={3} />
            </Field>
            <Field label="Descripción completa">
              <RichTextEditor value={v.content_html} onChange={(h) => set("content_html", h)} ariaLabel="Descripción del servicio" />
            </Field>
            <Field label="Dirección (URL)" htmlFor="s-slug" hint={`/servicios/${v.slug || "…"}`} error={errors.slug}>
              <Input
                id="s-slug"
                value={v.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
              />
            </Field>
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Icono">
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Icono del servicio">
              {Object.entries(ICONS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={v.icon === key}
                  aria-label={label}
                  title={label}
                  onClick={() => set("icon", key)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-xl border",
                    v.icon === key ? "border-sage-600 bg-sage-100 text-sage-800" : "border-stone-200 text-stone-600 hover:bg-stone-50",
                  )}
                >
                  <Icon name={key} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </Card>
          <Card title="Imagen">
            <MediaField value={v.media} onChange={(m) => set("media", m)} label="Imagen del servicio" />
          </Card>
        </div>
      </div>
    </div>
  );
}
