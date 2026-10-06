import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, List } from "lucide-react";
import { BlocksRenderer } from "@/components/blocks/blocks-renderer";
import { PageHero } from "@/components/public/page-hero";
import { EventCard, type EventCardData } from "@/components/public/event-card";
import { MonthCalendar, type CalendarDay } from "@/components/public/month-calendar";
import { getPageBySlug } from "@/features/site/queries";
import { getEventCategories, listEventsInRange, listUpcomingEvents, type EventListItem } from "@/features/events/queries";
import { pageMetadata } from "@/features/pages/metadata";
import { dayKey, eventDayKeys, formatMadrid, inMadrid, madridLocalToUtcIso, monthGridRange } from "@/lib/dates";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("eventos", "Eventos y calendario", "/eventos");
}

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function EventsPage(props: PageProps<"/eventos">) {
  const sp = await props.searchParams;
  const view = one(sp.vista) === "lista" ? "lista" : "calendario";
  const now = inMadrid(new Date());
  const todayKey = dayKey(new Date());

  const monthParam = one(sp.mes);
  let year = now.getFullYear();
  let month = now.getMonth();
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }
  const dayParam = one(sp.dia);
  const selectedDay = dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) ? dayParam : null;
  if (selectedDay && !monthParam) {
    year = Number(selectedDay.slice(0, 4));
    month = Number(selectedDay.slice(5, 7)) - 1;
  }

  const [resolved, categories] = await Promise.all([getPageBySlug("eventos"), getEventCategories()]);
  const category = categories.find((c) => c.slug === one(sp.categoria)) ?? null;
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const toCard = (e: EventListItem): EventCardData & { id: string } => ({
    ...e,
    categoryName: e.category_id ? (catMap.get(e.category_id)?.name ?? null) : null,
    categoryColor: e.category_id ? (catMap.get(e.category_id)?.color ?? null) : null,
  });

  const grid = monthGridRange(year, month);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const [monthEvents, upcoming] = await Promise.all([
    view === "calendario" ? listEventsInRange(grid.from, grid.to, category?.id) : Promise.resolve([]),
    view === "lista" ? listUpcomingEvents(60, category?.id) : Promise.resolve([]),
  ]);

  const byDay = new Map<string, EventListItem[]>();
  for (const e of monthEvents) {
    for (const k of eventDayKeys(e.starts_at, e.ends_at)) {
      const list = byDay.get(k) ?? [];
      list.push(e);
      byDay.set(k, list);
    }
  }
  const days: CalendarDay[] = grid.days.map((k) => ({
    key: k,
    day: Number(k.slice(8, 10)),
    inMonth: k.slice(0, 7) === monthKey,
    isToday: k === todayKey,
    events: (byDay.get(k) ?? []).map((e) => ({ id: e.id, title: e.title, color: e.category_id ? (catMap.get(e.category_id)?.color ?? null) : null })),
  }));

  const params = (over: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const base: Record<string, string | null> = {
      vista: view === "lista" ? "lista" : null,
      mes: monthKey,
      dia: selectedDay,
      categoria: category?.slug ?? null,
      ...over,
    };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    const s = p.toString();
    return `/eventos${s ? `?${s}` : ""}`;
  };
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const labelFor = (k: string) => formatMadrid(madridLocalToUtcIso(k, "12:00"), "EEEE d 'de' MMMM");
  const monthTitle = formatMadrid(madridLocalToUtcIso(`${monthKey}-01`, "12:00"), "MMMM yyyy");

  const dayEvents = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const monthList = monthEvents.filter((e) => dayKey(e.ends_at) >= `${monthKey}-01` && dayKey(e.starts_at) <= `${monthKey}-31`);

  const blocks = resolved?.blocks ?? [];
  return (
    <>
      {blocks.length ? (
        <BlocksRenderer blocks={blocks} />
      ) : (
        <PageHero eyebrow="Agenda" title="Eventos y calendario" intro="Actividades, celebraciones y encuentros abiertos a las familias." />
      )}
      <section className="container-site pb-20 pt-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-full border border-line bg-surface p-1" role="group" aria-label="Tipo de vista">
            <Link href={params({ vista: null })} aria-current={view === "calendario" ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold", view === "calendario" ? "bg-primary text-primary-contrast" : "hover:bg-primary/10")}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Calendario
            </Link>
            <Link href={params({ vista: "lista", dia: null })} aria-current={view === "lista" ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold", view === "lista" ? "bg-primary text-primary-contrast" : "hover:bg-primary/10")}>
              <List className="h-4 w-4" aria-hidden="true" /> Próximos eventos
            </Link>
          </div>
          {categories.length ? (
            <nav aria-label="Filtrar por categoría">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link href={params({ categoria: null })} aria-current={!category ? "page" : undefined} className={cn("inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold", !category ? "border-primary bg-primary/10 text-primary" : "border-line hover:border-primary")}>
                    Todas
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={params({ categoria: c.slug })} aria-current={category?.id === c.id ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold", category?.id === c.id ? "border-primary bg-primary/10 text-primary" : "border-line hover:border-primary")}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        {view === "calendario" ? (
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
            <MonthCalendar
              title={monthTitle}
              days={days}
              selected={selectedDay}
              prevHref={params({ mes: shift(-1), dia: null })}
              nextHref={params({ mes: shift(1), dia: null })}
              todayHref={params({ mes: todayKey.slice(0, 7), dia: todayKey })}
              dayHref={(k) => params({ mes: k.slice(0, 7), dia: k })}
              dayLabel={labelFor}
            />
            <div aria-live="polite">
              {selectedDay ? (
                <>
                  <h2 className="heading-3 mb-4 first-letter:uppercase">{labelFor(selectedDay)}</h2>
                  {dayEvents.length ? (
                    <ul className="space-y-4">
                      {dayEvents.map((e) => (
                        <li key={e.id}>
                          <EventCard event={toCard(e)} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="card p-6 text-muted">No hay eventos este día.</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="heading-3 mb-4 first-letter:uppercase">Eventos de {monthTitle}</h2>
                  {monthList.length ? (
                    <ul className="space-y-4">
                      {monthList.map((e) => (
                        <li key={e.id}>
                          <EventCard event={toCard(e)} compact />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="card p-6 text-muted">No hay eventos publicados este mes.</p>
                  )}
                  <p className="mt-4 text-sm text-muted">Selecciona un día del calendario para ver sus eventos.</p>
                </>
              )}
            </div>
          </div>
        ) : upcoming.length ? (
          <ol className="mx-auto max-w-3xl space-y-4">
            {upcoming.map((e, i) => {
              const showMonth = i === 0 || formatMadrid(upcoming[i - 1].starts_at, "yyyy-MM") !== formatMadrid(e.starts_at, "yyyy-MM");
              return (
                <li key={e.id}>
                  {showMonth ? <h2 className="mb-3 mt-8 font-heading text-xl capitalize text-primary first:mt-0">{formatMadrid(e.starts_at, "MMMM yyyy")}</h2> : null}
                  <EventCard event={toCard(e)} />
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="card mx-auto max-w-lg p-10 text-center text-muted">No hay próximos eventos publicados.</p>
        )}
      </section>
    </>
  );
}
