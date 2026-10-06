"use client";

import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-site section-y text-center" role="alert">
      <h1 className="heading-2">Lo sentimos, algo ha fallado</h1>
      <p className="lead mx-auto mt-4 max-w-xl">No hemos podido mostrar esta página. Inténtalo de nuevo en unos instantes.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
