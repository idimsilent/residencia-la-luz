import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sage-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#ead9c4]/60 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-sage-700">
          <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="20" cy="17" r="6" />
            <path d="M20 5v3M9.5 9.5l2 2M30.5 9.5l-2 2M6 17h3M31 17h3M8 31c4-4 8-5 12-5s8 1 12 5" />
          </svg>
          <span className="text-sm font-extrabold uppercase tracking-widest">Panel de gestión</span>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/5">
          <h1 className="text-xl text-stone-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
