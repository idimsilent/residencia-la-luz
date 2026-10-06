"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- Botones ---- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-sage-600 text-white hover:bg-sage-700 shadow-sm",
  secondary: "bg-white text-stone-800 border border-stone-300 hover:bg-stone-50",
  ghost: "text-stone-700 hover:bg-stone-200/60",
  danger: "bg-[#b42318] text-white hover:bg-[#912018]",
  subtle: "bg-sage-100 text-sage-800 hover:bg-sage-200",
};
const SIZES = { sm: "h-8 px-3 text-sm gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-5 text-base gap-2" };

export function buttonClasses(variant: Variant = "primary", size: keyof typeof SIZES = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-55",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES; loading?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
}: {
  href: string;
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className={buttonClasses(variant, size, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------- Formularios ---- */

export function Field({
  label,
  hint,
  error,
  children,
  required,
  className,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[];
  children: ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}) {
  const err = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-bold text-stone-800">
        {label}
        {required ? <span className="text-[#b42318]"> *</span> : null}
      </label>
      {children}
      {hint && !err ? <p className="text-xs text-stone-500">{hint}</p> : null}
      {err ? (
        <p className="text-xs font-bold text-[#b42318]" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn("admin-input", className)} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn("admin-input min-h-24", className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn("admin-input pr-8", className)}>
      {children}
    </select>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50",
          checked ? "bg-sage-600" : "bg-stone-300",
        )}
      >
        <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-bold text-stone-800">{label}</span>
        {description ? <span className="block text-xs text-stone-500">{description}</span> : null}
      </label>
    </div>
  );
}

/* ----------------------------------------------------------- Estructura ---- */

export function Card({ children, className, title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-stone-200 bg-white shadow-sm", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5">
          {title ? <h2 className="text-base">{title}</h2> : <span />}
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "info" | "danger" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    success: "bg-sage-100 text-sage-800",
    warning: "bg-amber-100 text-amber-900",
    info: "bg-sky-100 text-sky-900",
    danger: "bg-red-100 text-red-900",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
      <p className="text-lg font-extrabold text-stone-800">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-stone-600">{children}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "success" | "danger"; children: ReactNode }) {
  const map = {
    info: ["bg-sky-50 border-sky-200 text-sky-950", Info],
    warning: ["bg-amber-50 border-amber-200 text-amber-950", AlertTriangle],
    success: ["bg-sage-50 border-sage-200 text-sage-900", CheckCircle2],
    danger: ["bg-red-50 border-red-200 text-red-950", AlertTriangle],
  } as const;
  const [cls, Icon] = map[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-3.5 text-sm", cls)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------- Diálogo ---- */

/** Diálogo modal accesible basado en <dialog> (foco atrapado y tecla Escape). */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-6xl" };
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn("admin-shell m-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-stone-900/50", widths[size])}
    >
      {open ? (
        <div className="flex max-h-[88vh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-4">
            <h2 className="text-lg">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Cerrar">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-stone-100 px-5 py-3">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}

type ConfirmOptions = { title: string; message: ReactNode; confirmLabel?: string; tone?: "danger" | "primary" };

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);

/** Confirmación antes de acciones destructivas: const ok = await confirm({...}) */
export function useConfirm() {
  return useContext(ConfirmContext);
}

/* ---------------------------------------------------------------- Avisos ---- */

type Toast = { id: number; tone: "success" | "error" | "info"; text: string };
const ToastContext = createContext<(tone: Toast["tone"], text: string) => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    [],
  );
  const close = (v: boolean) => {
    pending?.resolve(v);
    setPending(null);
  };

  return (
    <ToastContext.Provider value={push}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <Dialog
          open={Boolean(pending)}
          onClose={() => close(false)}
          title={pending?.title ?? ""}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => close(false)}>
                Cancelar
              </Button>
              <Button variant={pending?.tone === "primary" ? "primary" : "danger"} onClick={() => close(true)} autoFocus>
                {pending?.confirmLabel ?? "Confirmar"}
              </Button>
            </>
          }
        >
          <div className="text-sm text-stone-700">{pending?.message}</div>
        </Dialog>
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-fade-up",
                t.tone === "success" && "bg-sage-700 text-white",
                t.tone === "error" && "bg-[#912018] text-white",
                t.tone === "info" && "bg-stone-800 text-white",
              )}
            >
              {t.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              {t.tone === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

/* ---------------------------------------------------------- Ruta del panel ---- */

const AdminBaseContext = createContext<string>("/gestion-centro");

export function AdminBaseProvider({ base, children }: { base: string; children: ReactNode }) {
  return <AdminBaseContext.Provider value={base}>{children}</AdminBaseContext.Provider>;
}

/** Enlaces del panel en componentes cliente: const href = useAdminHref()("/noticias") */
export function useAdminHref() {
  const base = useContext(AdminBaseContext);
  return useCallback((path = "") => (path && path !== "/" ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base), [base]);
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl text-stone-900 sm:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-stone-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
