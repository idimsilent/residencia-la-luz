export default function Loading() {
  return (
    <div className="animate-pulse" role="status" aria-label="Cargando">
      <div className="mb-6 h-8 w-64 rounded-lg bg-stone-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-stone-200/70" />
        ))}
      </div>
    </div>
  );
}
