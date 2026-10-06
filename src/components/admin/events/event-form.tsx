"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink, Trash2 } from "lucide-react";
import { deleteEvents, duplicateEvent, saveEvent } from "@/features/events/actions";
import type { MediaLite } from "@/features/media/url";
import { RichTextEditor } from "../rich-text-editor";
import { MediaField } from "../media-picker";
import { Badge, Button, Card, Field, Input, Select, Switch, Textarea, useAdminHref, useConfirm, useToast } from "../ui";
import { slugify } from "@/lib/utils";

export type EventFormInitial = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description_html: string;
  all_day: boolean;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  media: MediaLite | null;
  category_id: string;
  status: "draft" | "published";
  is_featured: boolean;
  has_detail_page: boolean;
  external_url: string;
};

export function EventForm({ initial, categories }: { initial: EventFormInitial; categories: { id: string; name: string; color: string }[] }) {
  const [v, setV] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const href = useAdminHref();

  const set = <K extends keyof EventFormInitial>(key: K, value: EventFormInitial[K]) => {
    setV((s) => {
      const next = { ...s, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      // Si la fecha de inicio pasa a ser posterior al final, el final la acompaña.
      if (key === "start_date" && next.end_date < String(value)) next.end_date = String(value);
      return next;
    });
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = (status: "draft" | "published") =>
    startTransition(async () => {
      const res = await saveEvent({
        id: v.id,
        title: v.title,
        slug: v.slug,
        summary: v.summary,
        description_html: v.description_html,
        all_day: v.all_day,
        start_date: v.start_date,
        start_time: v.all_day ? "" : v.start_time,
        end_date: v.end_date,
        end_time: v.all_day ? "" : v.end_time,
        location: v.location,
        media_id: v.media?.id ?? null,
        category_id: v.category_id || null,
        status,
        is_featured: v.is_featured,
        has_detail_page: v.has_detail_page,
        external_url: v.external_url,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast("error", res.error);
        return;
      }
      setErrors({});
      setDirty(false);
      setV((s) => ({ ...s, status, id: res.data?.id ?? s.id, slug: res.data?.slug ?? s.slug }));
      toast("success", res.message ?? "Guardado.");
      if (!v.id && res.data) router.replace(href(`/eventos/${res.data.id}`));
      else router.refresh();
    });

  const duplicate = () =>
    startTransition(async () => {
      if (!v.id) return;
      const res = await duplicateEvent(v.id);
      if (!res.ok) return toast("error", res.error);
      toast("success", res.message ?? "Copia creada.");
      if (res.data) router.push(href(`/eventos/${res.data.id}`));
    });

  const remove = async () => {
    if (!v.id) return;
    const ok = await confirm({ title: "¿Eliminar este evento?", message: <>«{v.title}» se borrará definitivamente del calendario.</>, confirmLabel: "Eliminar" });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteEvents([v.id!]);
      if (!res.ok) return toast("error", res.error);
      setDirty(false);
      toast("success", res.message ?? "Eliminado.");
      router.push(href("/eventos"));
    });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={href("/eventos")} prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Calendario
        </Link>
        <h1 className="text-xl text-stone-900">{initial.id ? "Editar evento" : "Nuevo evento"}</h1>
        {initial.id ? <Badge tone={initial.status === "published" ? "success" : "warning"}>{initial.status === "published" ? "Publicado" : "Borrador"}</Badge> : null}
        {dirty ? <span className="text-xs font-bold text-amber-700">Cambios sin guardar</span> : null}
        <span className="ml-auto flex flex-wrap gap-2">
          {v.id ? (
            <>
              <Button variant="ghost" onClick={duplicate} disabled={pending}>
                <Copy className="h-4 w-4" aria-hidden="true" /> Duplicar
              </Button>
              <Button variant="ghost" onClick={remove} disabled={pending} className="text-[#b42318]">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
              </Button>
              {v.has_detail_page ? (
                <a
                  href={`/api/preview?ruta=${encodeURIComponent(`/eventos/${v.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 hover:bg-stone-50"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver en la web
                </a>
              ) : null}
            </>
          ) : null}
          <Button variant="secondary" onClick={() => save("draft")} loading={pending}>
            Guardar borrador
          </Button>
          <Button onClick={() => save("published")} loading={pending}>
            {initial.status === "published" && initial.id ? "Guardar" : "Publicar"}
          </Button>
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <Field label="Título" htmlFor="e-title" required error={errors.title}>
                <Input id="e-title" value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className="text-lg font-bold" />
              </Field>
              <Field label="Resumen" htmlFor="e-summary" hint="Una o dos frases que se ven en el calendario y en la portada." error={errors.summary}>
                <Textarea id="e-summary" value={v.summary} onChange={(e) => set("summary", e.target.value)} maxLength={300} rows={2} />
              </Field>
              <Field label="Descripción">
                <RichTextEditor value={v.description_html} onChange={(html) => set("description_html", html)} ariaLabel="Descripción del evento" />
              </Field>
            </div>
          </Card>
          <Card title="Imagen">
            <div className="max-w-md">
              <MediaField value={v.media} onChange={(m) => set("media", m)} label="Imagen del evento" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Fecha y hora (Madrid)">
            <div className="space-y-4">
              <Switch checked={v.all_day} onChange={(c) => set("all_day", c)} label="Todo el día" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha de inicio" htmlFor="e-sd" error={errors.start_date}>
                  <Input id="e-sd" type="date" value={v.start_date} onChange={(e) => set("start_date", e.target.value)} />
                </Field>
                {!v.all_day ? (
                  <Field label="Hora de inicio" htmlFor="e-st" error={errors.start_time}>
                    <Input id="e-st" type="time" value={v.start_time} onChange={(e) => set("start_time", e.target.value)} />
                  </Field>
                ) : (
                  <span />
                )}
                <Field label="Fecha de fin" htmlFor="e-ed" error={errors.end_date}>
                  <Input id="e-ed" type="date" value={v.end_date} min={v.start_date} onChange={(e) => set("end_date", e.target.value)} />
                </Field>
                {!v.all_day ? (
                  <Field label="Hora de fin" htmlFor="e-et">
                    <Input id="e-et" type="time" value={v.end_time} onChange={(e) => set("end_time", e.target.value)} />
                  </Field>
                ) : null}
              </div>
            </div>
          </Card>
          <Card title="Detalles">
            <div className="space-y-4">
              <Field label="Lugar" htmlFor="e-loc" hint="Por ejemplo: «Salón principal» o «Jardín».">
                <Input id="e-loc" value={v.location} onChange={(e) => set("location", e.target.value)} maxLength={200} />
              </Field>
              <Field label="Categoría" htmlFor="e-cat">
                <Select id="e-cat" value={v.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Switch checked={v.is_featured} onChange={(c) => set("is_featured", c)} label="Destacar en la portada" />
              <Switch checked={v.has_detail_page} onChange={(c) => set("has_detail_page", c)} label="Tiene página propia" description="Si lo desactivas, solo aparece en el calendario." />
              <Field label="Enlace externo (opcional)" htmlFor="e-url" hint="Inscripción o más información. Debe empezar por https://" error={errors.external_url}>
                <Input id="e-url" type="url" value={v.external_url} onChange={(e) => set("external_url", e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Dirección (URL)" htmlFor="e-slug" hint={`/eventos/${v.slug || "…"}`} error={errors.slug}>
                <Input
                  id="e-slug"
                  value={v.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                  maxLength={100}
                />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
