import Link from "next/link";

/** 404 global (fuera del layout público). */
export default function GlobalNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbf8f3] px-6 text-center text-[#2b2f2a]">
      <p className="text-sm font-bold uppercase tracking-widest text-[#5f7d63]">Error 404</p>
      <h1 className="mt-3 font-heading text-4xl">Página no encontrada</h1>
      <Link href="/" className="mt-8 rounded-full bg-[#5f7d63] px-6 py-3 font-bold text-white">
        Ir al inicio
      </Link>
    </main>
  );
}
