"use client";

import { AlertTriangle } from "lucide-react";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm" role="alert">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />
      <h1 className="mt-4 text-xl text-stone-900">Algo no ha ido bien</h1>
      <p className="mt-2 text-sm text-stone-600">No se ha podido cargar esta sección. Tus datos guardados no se han perdido.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-lg bg-sage-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sage-700">
        Reintentar
      </button>
    </div>
  );
}
