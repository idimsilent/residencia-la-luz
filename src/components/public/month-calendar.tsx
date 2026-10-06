import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarDay = {
  key: string; // yyyy-MM-dd
  day: number;
  inMonth: boolean;
  isToday: boolean;
  events: { id: string; title: string; color: string | null }[];
};

const WEEKDAYS = [
  ["L", "lunes"],
  ["M", "martes"],
  ["X", "miércoles"],
  ["J", "jueves"],
  ["V", "viernes"],
  ["S", "sábado"],
  ["D", "domingo"],
] as const;

/**
 * Calendario mensual renderizado en servidor: funciona sin JavaScript, cada
 * día es un enlace navegable con teclado y anunciado con su nº de eventos.
 */
export function MonthCalendar({
  title,
  days,
  selected,
  prevHref,
  nextHref,
  todayHref,
  dayHref,
  dayLabel,
}: {
  title: string;
  days: CalendarDay[];
  selected: string | null;
  prevHref: string;
  nextHref: string;
  todayHref: string;
  dayHref: (key: string) => string;
  dayLabel: (key: string) => string;
}) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-2xl capitalize" id="titulo-mes" aria-live="polite">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <Link href={prevHref} scroll={false} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-primary/10" aria-label="Mes anterior">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href={todayHref} scroll={false} className="inline-flex h-11 items-center rounded-full px-3 text-sm font-semibold hover:bg-primary/10">
            Hoy
          </Link>
          <Link href={nextHref} scroll={false} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-primary/10" aria-label="Mes siguiente">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-1" aria-labelledby="titulo-mes">
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long]) => (
              <th key={long} scope="col" className="pb-2 text-center text-xs font-bold uppercase tracking-wider text-muted">
                <abbr title={long} className="no-underline">
                  {short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].key}>
              {week.map((d) => {
                const isSelected = selected === d.key;
                const count = d.events.length;
                return (
                  <td key={d.key} className="p-0 align-top">
                    <Link
                      href={dayHref(d.key)}
                      scroll={false}
                      aria-label={`${dayLabel(d.key)}${count ? `, ${count} ${count === 1 ? "evento" : "eventos"}` : ", sin eventos"}`}
                      aria-current={isSelected ? "date" : undefined}
                      className={cn(
                        "flex min-h-14 flex-col items-center rounded-theme-sm p-1.5 text-sm transition sm:min-h-20 sm:items-start sm:p-2",
                        !d.inMonth && "opacity-40",
                        isSelected ? "bg-primary text-primary-contrast" : "hover:bg-primary/10",
                        d.isToday && !isSelected && "ring-2 ring-primary/60",
                      )}
                    >
                      <span className="font-semibold">{d.day}</span>
                      {count ? (
                        <>
                          <span className="mt-1 flex gap-1 sm:hidden" aria-hidden="true">
                            {d.events.slice(0, 3).map((e) => (
                              <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: isSelected ? "currentColor" : (e.color ?? "var(--lz-color-primary)") }} />
                            ))}
                          </span>
                          <span className="mt-1 hidden w-full space-y-0.5 sm:block" aria-hidden="true">
                            {d.events.slice(0, 2).map((e) => (
                              <span
                                key={e.id}
                                className={cn("block truncate rounded px-1.5 py-0.5 text-[0.7rem] font-semibold", isSelected ? "bg-white/20" : "bg-primary/10 text-ink")}
                                style={isSelected ? undefined : { borderLeft: `3px solid ${e.color ?? "var(--lz-color-primary)"}` }}
                              >
                                {e.title}
                              </span>
                            ))}
                            {count > 2 ? <span className="block px-1.5 text-[0.7rem]">+{count - 2} más</span> : null}
                          </span>
                        </>
                      ) : null}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
