"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitContact } from "@/features/contact/actions";
import type { ActionResult } from "@/lib/action-result";

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-[#b42318]">
      {errors[0]}
    </p>
  );
}

export function ContactForm({ privacyNote, disabled = false }: { privacyNote: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitContact, null);
  const startedRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const v = state && !state.ok ? (state.values ?? {}) : {};

  if (state?.ok) {
    return (
      <div role="status" className="card flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
        <p className="font-heading text-2xl">Mensaje enviado</p>
        <p className="text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-5 p-6 sm:p-8" noValidate aria-describedby="form-estado">
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="0" />
      {/* Campo trampa antispam: oculto para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div id="form-estado" aria-live="polite">
        {state && !state.ok ? (
          <p className="flex items-start gap-2 rounded-theme-sm bg-[#fde8e6] p-3 text-sm font-semibold text-[#8a1c13]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {state.error}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block font-semibold">
            Nombre <span aria-hidden="true">*</span>
          </label>
          <input id="cf-name" name="name" defaultValue={v.name} required autoComplete="name" className="field-input" aria-invalid={Boolean(fe?.name)} aria-describedby={fe?.name ? "cf-name-err" : undefined} maxLength={120} />
          <FieldError id="cf-name-err" errors={fe?.name} />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block font-semibold">
            Correo electrónico <span aria-hidden="true">*</span>
          </label>
          <input id="cf-email" name="email" defaultValue={v.email} type="email" required autoComplete="email" className="field-input" aria-invalid={Boolean(fe?.email)} aria-describedby={fe?.email ? "cf-email-err" : undefined} maxLength={254} />
          <FieldError id="cf-email-err" errors={fe?.email} />
        </div>
        <div>
          <label htmlFor="cf-phone" className="mb-1.5 block font-semibold">
            Teléfono <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input id="cf-phone" name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" className="field-input" aria-invalid={Boolean(fe?.phone)} aria-describedby={fe?.phone ? "cf-phone-err" : undefined} maxLength={30} />
          <FieldError id="cf-phone-err" errors={fe?.phone} />
        </div>
        <div>
          <label htmlFor="cf-subject" className="mb-1.5 block font-semibold">
            Asunto <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input id="cf-subject" name="subject" defaultValue={v.subject} className="field-input" maxLength={150} />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-1.5 block font-semibold">
          Mensaje <span aria-hidden="true">*</span>
        </label>
        <textarea id="cf-message" name="message" defaultValue={v.message} required rows={5} className="field-input" aria-invalid={Boolean(fe?.message)} aria-describedby={`cf-message-help${fe?.message ? " cf-message-err" : ""}`} maxLength={3000} />
        <p id="cf-message-help" className="mt-1.5 text-sm text-muted">
          Por favor, no incluyas datos de salud ni información médica en este formulario.
        </p>
        <FieldError id="cf-message-err" errors={fe?.message} />
      </div>
      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="privacy" required className="mt-1 h-5 w-5 accent-[var(--lz-color-primary)]" aria-invalid={Boolean(fe?.privacy)} aria-describedby={fe?.privacy ? "cf-privacy-err" : undefined} />
          <span className="text-sm">
            He leído y acepto la{" "}
            <Link href="/privacidad" className="font-semibold text-primary underline">
              política de privacidad
            </Link>
            . <span aria-hidden="true">*</span>
          </span>
        </label>
        <FieldError id="cf-privacy-err" errors={fe?.privacy} />
        {privacyNote ? <p className="mt-3 text-xs text-muted">{privacyNote}</p> : null}
      </div>
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending || disabled} aria-disabled={pending || disabled}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Enviando…" : "Enviar mensaje"}
        </button>
        {disabled ? <p className="mt-2 text-sm text-muted">Formulario desactivado en la vista previa.</p> : null}
      </div>
    </form>
  );
}
