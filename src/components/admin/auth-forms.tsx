"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { requestPasswordReset, signIn, updatePassword } from "@/features/auth/actions";
import type { ActionResult } from "@/lib/action-result";
import { Button, Field, Input, Notice, useAdminHref } from "./ui";

function PasswordInput({ id, name, autoComplete, invalid }: { id: string; name: string; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required aria-invalid={invalid} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-stone-500 hover:text-stone-800"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signIn, null);
  const href = useAdminHref();
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state && !state.ok ? <Notice tone="danger">{state.error}</Notice> : null}
      <Field label="Correo electrónico" htmlFor="email" error={fe?.email}>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus aria-invalid={Boolean(fe?.email)} />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={fe?.password}>
        <PasswordInput id="password" name="password" autoComplete="current-password" invalid={Boolean(fe?.password)} />
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Entrar
      </Button>
      <p className="text-center text-sm">
        <Link href={href("/recuperar")} className="font-semibold text-sage-700 hover:underline">
          ¿Has olvidado la contraseña?
        </Link>
      </p>
    </form>
  );
}

export function ResetRequestForm({ linkError }: { linkError?: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(requestPasswordReset, null);
  const href = useAdminHref();
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <Notice tone="success">{state.message}</Notice>
        <Link href={href("/acceso")} className="block text-center text-sm font-semibold text-sage-700 hover:underline">
          Volver al acceso
        </Link>
      </div>
    );
  }
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={action} className="space-y-4" noValidate>
      {linkError ? <Notice tone="warning">El enlace no es válido o ha caducado. Solicita uno nuevo.</Notice> : null}
      {state && !state.ok ? <Notice tone="danger">{state.error}</Notice> : null}
      <Field label="Correo electrónico" htmlFor="email" error={fe?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(fe?.email)} />
      </Field>
      <Button type="submit" className="w-full" loading={pending}>
        Enviar enlace
      </Button>
      <Link href={href("/acceso")} className="block text-center text-sm font-semibold text-sage-700 hover:underline">
        Volver al acceso
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updatePassword, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={action} className="space-y-4" noValidate>
      {state && !state.ok ? <Notice tone="danger">{state.error}</Notice> : null}
      <Field label="Nueva contraseña" htmlFor="password" error={fe?.password} hint="Mínimo 10 caracteres, con mayúsculas, minúsculas y números.">
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={Boolean(fe?.password)} />
      </Field>
      <Field label="Repite la contraseña" htmlFor="confirm" error={fe?.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={Boolean(fe?.confirm)} />
      </Field>
      <Button type="submit" className="w-full" loading={pending}>
        Guardar contraseña
      </Button>
    </form>
  );
}
