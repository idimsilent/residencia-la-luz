import { TZDate } from "@date-fns/tz";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";

/** Toda la web trabaja en hora peninsular española. */
export const TIME_ZONE = "Europe/Madrid";

export function inMadrid(date: Date | string | number): TZDate {
  return new TZDate(new Date(date).getTime(), TIME_ZONE);
}

export function formatMadrid(date: Date | string, pattern: string): string {
  return format(inMadrid(date), pattern, { locale: es });
}

/** "12 de marzo de 2026" */
export function formatLongDate(date: Date | string): string {
  return formatMadrid(date, "d 'de' MMMM 'de' yyyy");
}

/** "12 mar 2026, 17:30" */
export function formatDateTime(date: Date | string): string {
  return formatMadrid(date, "d MMM yyyy, HH:mm");
}

export function formatTime(date: Date | string): string {
  return formatMadrid(date, "HH:mm");
}

/** Clave de día "yyyy-MM-dd" en hora de Madrid. */
export function dayKey(date: Date | string): string {
  return formatMadrid(date, "yyyy-MM-dd");
}

/**
 * Convierte fecha ("2026-03-12") y hora ("17:30") locales de Madrid a un
 * instante ISO UTC. Gestiona correctamente los cambios de horario de verano.
 */
export function madridLocalToUtcIso(dateStr: string, timeStr = "00:00", seconds = 0): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const tz = new TZDate(y, m - 1, d, hh, mm, seconds, TIME_ZONE);
  return new Date(tz.getTime()).toISOString();
}

/** Inverso: instante -> { date: "yyyy-MM-dd", time: "HH:mm" } en Madrid. */
export function utcToMadridParts(iso: string): { date: string; time: string } {
  return { date: formatMadrid(iso, "yyyy-MM-dd"), time: formatMadrid(iso, "HH:mm") };
}

/** Rango [inicio, fin] (UTC ISO) visible en una cuadrícula mensual que empieza en lunes. */
export function monthGridRange(year: number, monthIndex: number): { from: string; to: string; days: string[] } {
  const first = new TZDate(year, monthIndex, 1, TIME_ZONE);
  const gridStart = startOfWeek(startOfMonth(first), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(first), { weekStartsOn: 1 });
  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    days.push(format(d, "yyyy-MM-dd"));
  }
  return {
    from: new Date(gridStart.getTime()).toISOString(),
    to: new Date(gridEnd.getTime()).toISOString(),
    days,
  };
}

/** Lista de días (yyyy-MM-dd, Madrid) que ocupa un evento. */
export function eventDayKeys(startsAt: string, endsAt: string): string[] {
  const keys: string[] = [];
  const end = dayKey(endsAt);
  let cursor = inMadrid(startsAt);
  for (let i = 0; i < 370; i++) {
    const key = format(cursor, "yyyy-MM-dd");
    keys.push(key);
    if (key >= end) break;
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function nowIso(): string {
  return new Date().toISOString();
}
