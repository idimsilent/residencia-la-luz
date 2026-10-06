"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import {
  deleteCategory, deleteTestimonial, inviteUser, saveCategory, saveTestimonial, setUserRole, updateOwnName, updateSeo,
} from "@/features/settings/actions";
import type { MediaLite } from "@/features/media/url";
import { MediaField } from "../media-picker";
import { Badge, Button, Card, Dialog, Field, Input, Select, Switch, Textarea, useConfirm, useToast } from "../ui";

function useRun() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string; fieldErrors?: Record<string, string[] | undefined> }>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error ?? "Error");
      if (res.message) toast("success", res.message);
      after?.();
      router.refresh();
    });
  return { pending, run };
}

/* ----------------------------------------------------------------- SEO ---- */

export function SeoForm({ initial }: { initial: { seo_title: string; seo_description: string; og: MediaLite | null } }) {
  const [v, setV] = useState(initial);
  const { pending, run } = useRun();
  return (
    <Card title="Buscadores y redes sociales">
      <div className="space-y-4">
        <Field label="Título de la web en buscadores" htmlFor="seo-t" hint={`${v.seo_title.length}/70`}>
          <Input id="seo-t" value={v.seo_title} maxLength={70} onChange={(e) => setV({ ...v, seo_title: e.target.value })} />
        </Field>
        <Field label="Descripción en buscadores" htmlFor="seo-d" hint={`${v.seo_description.length}/170`}>
          <Textarea id="seo-d" value={v.seo_description} maxLength={170} rows={3} onChange={(e) => setV({ ...v, seo_description: e.target.value })} />
        </Field>
        <div className="max-w-md">
          <p className="mb-1.5 text-sm font-bold text-stone-800">Imagen al compartir en redes</p>
          <MediaField value={v.og} onChange={(og) => setV({ ...v, og })} label="Imagen para redes" />
        </div>
        <Button loading={pending} onClick={() => run(() => updateSeo({ seo_title: v.seo_title, seo_description: v.seo_description, og_media_id: v.og?.id ?? null }))}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------- Categorías ---- */

type Cat = { id: string; name: string; slug: string; color?: string; count: number };

export function CategoriesManager({ kind, title, items }: { kind: "news" | "events" | "gallery"; title: string; items: Cat[] }) {
  const [edit, setEdit] = useState<Partial<Cat> | null>(null);
  const { pending, run } = useRun();
  const confirm = useConfirm();
  return (
    <Card
      title={title}
      actions={
        <Button size="sm" variant="secondary" onClick={() => setEdit({ name: "", slug: "", color: "#5f7d63" })}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nueva
        </Button>
      }
    >
      <ul className="divide-y divide-stone-100">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2">
            {kind === "events" ? <span className="h-3 w-3 rounded-full" style={{ background: c.color }} aria-hidden="true" /> : null}
            <span className="flex-1 text-sm font-bold text-stone-800">{c.name}</span>
            <span className="text-xs text-stone-500">{c.count} elementos</span>
            <button type="button" onClick={() => setEdit(c)} className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100" aria-label={`Editar ${c.name}`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={async () => {
                if (await confirm({ title: `¿Eliminar «${c.name}»?`, message: c.count ? `${c.count} elementos quedarán sin categoría.` : "La categoría no tiene contenido.", confirmLabel: "Eliminar" }))
                  run(() => deleteCategory({ kind, id: c.id }));
              }}
              className="rounded-lg p-1.5 text-[#b42318] hover:bg-red-50"
              aria-label={`Eliminar ${c.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
        {!items.length ? <li className="py-2 text-sm text-stone-500">Sin categorías.</li> : null}
      </ul>
      {edit ? (
        <Dialog
          open
          onClose={() => setEdit(null)}
          title={edit.id ? "Editar categoría" : "Nueva categoría"}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEdit(null)}>
                Cancelar
              </Button>
              <Button loading={pending} onClick={() => run(() => saveCategory({ kind, id: edit.id, name: edit.name ?? "", slug: edit.slug ?? "", color: edit.color }), () => setEdit(null))}>
                Guardar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nombre" htmlFor="cat-n" required>
              <Input id="cat-n" value={edit.name ?? ""} maxLength={80} autoFocus onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </Field>
            <Field label="Identificador en la URL" htmlFor="cat-s" hint="Se genera solo si lo dejas vacío.">
              <Input id="cat-s" value={edit.slug ?? ""} maxLength={80} onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </Field>
            {kind === "events" ? (
              <Field label="Color en el calendario" htmlFor="cat-c">
                <input id="cat-c" type="color" value={edit.color ?? "#5f7d63"} onChange={(e) => setEdit({ ...edit, color: e.target.value })} className="h-10 w-20 rounded-md border border-stone-300" />
              </Field>
            ) : null}
          </div>
        </Dialog>
      ) : null}
    </Card>
  );
}

/* --------------------------------------------------------- Testimonios ---- */

type Testimonial = { id?: string; quote: string; author_label: string; consent_confirmed: boolean; consent_reference: string; status: "draft" | "published" };

export function TestimonialsManager({ items, enabled }: { items: Required<Testimonial>[]; enabled: boolean }) {
  const [edit, setEdit] = useState<Testimonial | null>(null);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const { pending, run } = useRun();
  const confirm = useConfirm();
  const toast = useToast();
  return (
    <Card
      title="Testimonios"
      actions={
        <Button size="sm" variant="secondary" onClick={() => setEdit({ quote: "", author_label: "", consent_confirmed: false, consent_reference: "", status: "draft" })}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo
        </Button>
      }
    >
      <p className="mb-3 text-sm text-stone-600">
        Publica solo testimonios reales con autorización escrita. Firma de forma que no identifique a residentes (por ejemplo, «Hija de un residente»).
        {!enabled ? " La sección de testimonios está desactivada en «Información del centro»." : ""}
      </p>
      <ul className="divide-y divide-stone-100">
        {items.map((t) => (
          <li key={t.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm text-stone-800">«{t.quote}»</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                — {t.author_label}
                {t.status === "published" ? <Badge tone="success">Publicado</Badge> : <Badge tone="warning">Borrador</Badge>}
                {t.consent_confirmed ? <Badge tone="info">Consentimiento registrado</Badge> : <Badge tone="danger">Sin consentimiento</Badge>}
              </p>
            </div>
            <button type="button" onClick={() => setEdit(t)} className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100" aria-label="Editar testimonio">
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (await confirm({ title: "¿Eliminar el testimonio?", message: "Se borrará definitivamente.", confirmLabel: "Eliminar" })) run(() => deleteTestimonial(t.id));
              }}
              className="rounded-lg p-1.5 text-[#b42318] hover:bg-red-50"
              aria-label="Eliminar testimonio"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
        {!items.length ? <li className="py-2 text-sm text-stone-500">No hay testimonios.</li> : null}
      </ul>
      {edit ? (
        <Dialog
          open
          onClose={() => setEdit(null)}
          title={edit.id ? "Editar testimonio" : "Nuevo testimonio"}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEdit(null)}>
                Cancelar
              </Button>
              <Button
                loading={pending}
                onClick={async () => {
                  const res = await saveTestimonial(edit);
                  if (!res.ok) {
                    setErrors(res.fieldErrors ?? {});
                    return toast("error", res.error);
                  }
                  run(async () => res, () => setEdit(null));
                }}
              >
                Guardar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Testimonio" htmlFor="tm-q" required error={errors.quote}>
              <Textarea id="tm-q" value={edit.quote} maxLength={800} rows={4} onChange={(e) => setEdit({ ...edit, quote: e.target.value })} />
            </Field>
            <Field label="Firma" htmlFor="tm-a" required hint="Sin nombres completos de residentes." error={errors.author_label}>
              <Input id="tm-a" value={edit.author_label} maxLength={120} onChange={(e) => setEdit({ ...edit, author_label: e.target.value })} />
            </Field>
            <Switch checked={edit.consent_confirmed} onChange={(c) => setEdit({ ...edit, consent_confirmed: c })} label="Tengo el consentimiento por escrito para publicarlo" />
            <Field label="Referencia del consentimiento (interna)" htmlFor="tm-r" hint="Ej.: «Documento firmado el 12/03/2026, archivado en recepción»." error={errors.consent_confirmed}>
              <Input id="tm-r" value={edit.consent_reference} maxLength={200} onChange={(e) => setEdit({ ...edit, consent_reference: e.target.value })} />
            </Field>
            <Field label="Estado" htmlFor="tm-s">
              <Select id="tm-s" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Testimonial["status"] })}>
                <option value="draft">Borrador</option>
                <option value="published" disabled={!edit.consent_confirmed}>
                  Publicado
                </option>
              </Select>
            </Field>
          </div>
        </Dialog>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------ Usuarios ---- */

type UserRow = { id: string; email: string; full_name: string | null; role: "admin" | "editor" | null; isSelf: boolean };

export function UsersManager({ users, canInvite }: { users: UserRow[]; canInvite: boolean }) {
  const [invite, setInvite] = useState<{ email: string; role: "admin" | "editor" } | null>(null);
  const { pending, run } = useRun();
  const confirm = useConfirm();
  return (
    <Card
      title="Personas con acceso al panel"
      actions={
        <Button size="sm" variant="secondary" onClick={() => setInvite({ email: "", role: "editor" })}>
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Invitar
        </Button>
      }
    >
      <p className="mb-3 text-sm text-stone-600">
        <strong>Administración:</strong> todo, incluidos apariencia, menús, datos del centro y usuarios. <strong>Edición:</strong> contenidos (páginas, noticias, eventos, servicios, imágenes).
      </p>
      <ul className="divide-y divide-stone-100">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-stone-900">
                {u.full_name || u.email} {u.isSelf ? <Badge>Tú</Badge> : null}
              </span>
              {u.full_name ? <span className="block truncate text-xs text-stone-500">{u.email}</span> : null}
            </span>
            <label className="sr-only" htmlFor={`role-${u.id}`}>
              Rol de {u.email}
            </label>
            <Select
              id={`role-${u.id}`}
              value={u.role ?? ""}
              disabled={u.isSelf || pending}
              className="w-44"
              onChange={async (e) => {
                const role = (e.target.value || null) as UserRow["role"];
                if (!role && !(await confirm({ title: "¿Retirar el acceso?", message: `${u.email} no podrá entrar en el panel.`, confirmLabel: "Retirar acceso" }))) return;
                run(() => setUserRole({ userId: u.id, role }));
              }}
            >
              <option value="admin">Administración</option>
              <option value="editor">Edición</option>
              <option value="">Sin acceso</option>
            </Select>
          </li>
        ))}
      </ul>
      {invite ? (
        <Dialog
          open
          onClose={() => setInvite(null)}
          title="Invitar a una persona"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setInvite(null)}>
                Cancelar
              </Button>
              <Button loading={pending} disabled={!canInvite} onClick={() => run(() => inviteUser(invite), () => setInvite(null))}>
                Enviar invitación
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {!canInvite ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Para enviar invitaciones desde aquí, el servidor necesita la clave secreta de Supabase (SUPABASE_SECRET_KEY). Mientras tanto, crea cuentas con el script <code>npm run admin:create</code> (ver README).
              </p>
            ) : null}
            <Field label="Correo electrónico" htmlFor="inv-e" required>
              <Input id="inv-e" type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            </Field>
            <Field label="Rol" htmlFor="inv-r">
              <Select id="inv-r" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as "admin" | "editor" })}>
                <option value="editor">Edición</option>
                <option value="admin">Administración</option>
              </Select>
            </Field>
            <p className="text-xs text-stone-500">Recibirá un correo con un enlace para crear su contraseña. No existe registro público.</p>
          </div>
        </Dialog>
      ) : null}
    </Card>
  );
}

export function OwnProfileForm({ name, email }: { name: string; email: string }) {
  const [v, setV] = useState(name);
  const { pending, run } = useRun();
  return (
    <Card title="Mi cuenta">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Nombre visible" htmlFor="me-n" hint={email} className="min-w-60 flex-1">
          <Input id="me-n" value={v} maxLength={120} onChange={(e) => setV(e.target.value)} />
        </Field>
        <Button loading={pending} onClick={() => run(() => updateOwnName(v))}>
          Guardar
        </Button>
      </div>
      <p className="mt-3 text-xs text-stone-500">Para cambiar tu contraseña, cierra sesión y usa «¿Has olvidado tu contraseña?» en la pantalla de acceso.</p>
    </Card>
  );
}
