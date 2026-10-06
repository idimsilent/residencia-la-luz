/**
 * Se muestra cuando faltan las variables de Supabase. No simula datos:
 * explica qué falta y dónde configurarlo.
 */
export function SetupRequired({ area = "web" }: { area?: "web" | "panel" }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf8f3] px-6 py-16 text-[#2b2f2a]">
      <div className="max-w-xl rounded-3xl bg-white p-8 shadow-lg sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#5f7d63]">Configuración pendiente</p>
        <h1 className="mt-3 font-heading text-3xl">La base de datos aún no está conectada</h1>
        <p className="mt-4 text-[#5d625b]">
          {area === "panel"
            ? "El panel de administración necesita Supabase para el inicio de sesión y el contenido."
            : "La web obtiene todos sus textos, noticias y eventos de Supabase."}{" "}
          Define estas variables de entorno y vuelve a desplegar:
        </p>
        <ul className="mt-5 space-y-2 rounded-2xl bg-[#f3eee5] p-5 font-mono text-sm">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
          <li>SUPABASE_SECRET_KEY</li>
          <li>NEXT_PUBLIC_SITE_URL</li>
          <li>ADMIN_PATH</li>
        </ul>
        <p className="mt-5 text-sm text-[#5d625b]">
          Los pasos completos están en el archivo <strong>README.md</strong>, sección «Configurar Supabase».
        </p>
      </div>
    </main>
  );
}
