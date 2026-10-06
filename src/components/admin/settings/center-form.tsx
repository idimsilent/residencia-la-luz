"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateCenterInfo } from "@/features/settings/actions";
import type { MediaLite } from "@/features/media/url";
import { SOCIAL_NETWORKS } from "@/components/public/social-icon";
import { MediaField } from "../media-picker";
import { Button, Card, Field, Input, Notice, Select, Switch, Textarea, useToast } from "../ui";

export type CenterInitial = {
  site_name: string;
  tagline: string;
  logo: MediaLite | null;
  favicon: MediaLite | null;
  phone: string;
  phone_secondary: string;
  email: string;
  address_line: string;
  postal_code: string;
  city: string;
  province: string;
  map_url: string;
  opening_hours: { label: string; hours: string }[];
  social_links: { network: (typeof SOCIAL_NETWORKS)[number]["value"]; url: string }[];
  contact_form_enabled: boolean;
  testimonials_enabled: boolean;
  contact_privacy_note: string;
  legal_owner_name: string;
  legal_owner_tax_id: string;
  show_demo_notice: boolean;
};

export function CenterForm({ initial }: { initial: CenterInitial }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const set = <K extends keyof CenterInitial>(k: K, val: CenterInitial[K]) => setV((s) => ({ ...s, [k]: val }));
  const T = (k: keyof CenterInitial, label: string, max: number, extra?: { hint?: string; type?: string; placeholder?: string }) => (
    <Field label={label} htmlFor={`c-${k}`} hint={extra?.hint} error={errors[k]}>
      <Input id={`c-${k}`} type={extra?.type ?? "text"} value={v[k] as string} maxLength={max} placeholder={extra?.placeholder} onChange={(e) => set(k, e.target.value as never)} />
    </Field>
  );

  const save = () =>
    startTransition(async () => {
      const res = await updateCenterInfo({
        site_name: v.site_name,
        tagline: v.tagline,
        logo_media_id: v.logo?.id ?? null,
        favicon_media_id: v.favicon?.id ?? null,
        phone: v.phone,
        phone_secondary: v.phone_secondary,
        email: v.email,
        address_line: v.address_line,
        postal_code: v.postal_code,
        city: v.city,
        province: v.province,
        map_url: v.map_url,
        opening_hours: v.opening_hours,
        social_links: v.social_links,
        contact_form_enabled: v.contact_form_enabled,
        testimonials_enabled: v.testimonials_enabled,
        contact_privacy_note: v.contact_privacy_note,
        legal_owner_name: v.legal_owner_name,
        legal_owner_tax_id: v.legal_owner_tax_id,
        show_demo_notice: v.show_demo_notice,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        return toast("error", res.error);
      }
      setErrors({});
      toast("success", res.message ?? "Guardado.");
    });

  return (
    <div className="space-y-6">
      <Notice tone="warning">Introduce solo datos reales y comprobados del centro. Los valores actuales son de demostración.</Notice>
      <Card title="Identidad">
        <div className="grid gap-4 md:grid-cols-2">
          {T("site_name", "Nombre del centro", 120)}
          {T("tagline", "Lema o descripción breve", 200)}
          <div>
            <p className="mb-1.5 text-sm font-bold text-stone-800">Logotipo</p>
            <MediaField value={v.logo} onChange={(m) => set("logo", m)} label="Logotipo" aspect="aspect-[3/1]" />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-bold text-stone-800">Icono de la pestaña (favicon)</p>
            <div className="max-w-32">
              <MediaField value={v.favicon} onChange={(m) => set("favicon", m)} label="Favicon" aspect="aspect-square" />
            </div>
          </div>
        </div>
      </Card>
      <Card title="Contacto y ubicación">
        <div className="grid gap-4 md:grid-cols-2">
          {T("phone", "Teléfono principal", 30, { type: "tel" })}
          {T("phone_secondary", "Otro teléfono", 30, { type: "tel" })}
          {T("email", "Correo electrónico", 254, { type: "email" })}
          {T("address_line", "Dirección", 200)}
          {T("postal_code", "Código postal", 10)}
          {T("city", "Localidad", 80)}
          {T("province", "Provincia", 80)}
          {T("map_url", "Enlace del mapa para insertar", 500, { hint: "Google Maps › Compartir › Insertar un mapa: copia solo la dirección que empieza por https:// (o un enlace de OpenStreetMap).", placeholder: "https://www.google.com/maps/embed?pb=…" })}
        </div>
      </Card>
      <Card title="Horario">
        <div className="space-y-2">
          {v.opening_hours.map((h, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <Field label="Días" htmlFor={`oh-l-${i}`} className="min-w-40 flex-1">
                <Input id={`oh-l-${i}`} value={h.label} maxLength={60} onChange={(e) => set("opening_hours", v.opening_hours.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              </Field>
              <Field label="Horas" htmlFor={`oh-h-${i}`} className="min-w-40 flex-1">
                <Input id={`oh-h-${i}`} value={h.hours} maxLength={80} onChange={(e) => set("opening_hours", v.opening_hours.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} />
              </Field>
              <Button variant="ghost" className="text-[#b42318]" aria-label="Quitar franja" onClick={() => set("opening_hours", v.opening_hours.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          {v.opening_hours.length < 10 ? (
            <Button size="sm" variant="secondary" onClick={() => set("opening_hours", [...v.opening_hours, { label: "", hours: "" }])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Añadir franja
            </Button>
          ) : null}
        </div>
      </Card>
      <Card title="Redes sociales">
        <div className="space-y-2">
          {v.social_links.map((s, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <Field label="Red" htmlFor={`sl-n-${i}`} className="w-44">
                <Select id={`sl-n-${i}`} value={s.network} onChange={(e) => set("social_links", v.social_links.map((x, j) => (j === i ? { ...x, network: e.target.value as typeof s.network } : x)))}>
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Enlace" htmlFor={`sl-u-${i}`} className="min-w-60 flex-1" error={errors[`social_links`]}>
                <Input id={`sl-u-${i}`} value={s.url} placeholder="https://" onChange={(e) => set("social_links", v.social_links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              </Field>
              <Button variant="ghost" className="text-[#b42318]" aria-label="Quitar red" onClick={() => set("social_links", v.social_links.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          {v.social_links.length < 8 ? (
            <Button size="sm" variant="secondary" onClick={() => set("social_links", [...v.social_links, { network: "facebook", url: "" }])}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Añadir red social
            </Button>
          ) : null}
        </div>
      </Card>
      <Card title="Formulario, privacidad y textos legales">
        <div className="space-y-4">
          <Switch checked={v.contact_form_enabled} onChange={(c) => set("contact_form_enabled", c)} label="Formulario de contacto activo" description="Si lo desactivas, la página de contacto muestra solo teléfono y correo." />
          <Switch checked={v.testimonials_enabled} onChange={(c) => set("testimonials_enabled", c)} label="Mostrar testimonios" description="Solo se publican testimonios con consentimiento registrado." />
          <Field label="Texto informativo de privacidad del formulario" htmlFor="c-privacy" hint="Responsable, finalidad y derechos. Debe revisarlo la persona responsable de protección de datos.">
            <Textarea id="c-privacy" value={v.contact_privacy_note} maxLength={1000} rows={4} onChange={(e) => set("contact_privacy_note", e.target.value)} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            {T("legal_owner_name", "Titular legal (razón social)", 160)}
            {T("legal_owner_tax_id", "NIF/CIF del titular", 20)}
          </div>
          <Switch checked={v.show_demo_notice} onChange={(c) => set("show_demo_notice", c)} label="Mostrar aviso de «web en preparación»" description="Desactívalo solo cuando los textos legales y los datos sean definitivos y estén revisados." />
        </div>
      </Card>
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={save} loading={pending} className="shadow-lg">
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
