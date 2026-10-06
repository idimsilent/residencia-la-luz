import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  return (
    <nav aria-label="Paginación" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn btn-secondary min-h-11 px-4" rel="prev">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Anteriores</span>
        </Link>
      ) : null}
      <ul className="flex items-center gap-1">
        {pages.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-muted">…</span> : null}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-semibold",
                p === page ? "bg-primary text-primary-contrast" : "hover:bg-primary/10",
              )}
            >
              <span className="sr-only">Página </span>
              {p}
            </Link>
          </li>
        ))}
      </ul>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="btn btn-secondary min-h-11 px-4" rel="next">
          <span className="hidden sm:inline">Siguientes</span> <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
