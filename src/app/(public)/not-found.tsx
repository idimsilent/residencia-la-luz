import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="heading-1 mt-3">No encontramos esta página</h1>
      <p className="lead mt-4 max-w-lg">Puede que el enlace haya cambiado o que la página ya no exista.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Ir al inicio
        </Link>
        <Link href="/contacto" className="btn btn-secondary">
          Contactar
        </Link>
      </div>
    </section>
  );
}
