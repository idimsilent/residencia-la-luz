import { describe, expect, it } from "vitest";
import { dayKey, eventDayKeys, madridLocalToUtcIso, monthGridRange, utcToMadridParts } from "@/lib/dates";

describe("fechas en hora de Madrid", () => {
  it("convierte hora local de invierno (UTC+1)", () => {
    expect(madridLocalToUtcIso("2026-12-24", "09:30")).toBe("2026-12-24T08:30:00.000Z");
  });

  it("convierte hora local de verano (UTC+2)", () => {
    expect(madridLocalToUtcIso("2026-07-15", "17:00")).toBe("2026-07-15T15:00:00.000Z");
  });

  it("es reversible", () => {
    const iso = madridLocalToUtcIso("2026-03-29", "12:15");
    expect(utcToMadridParts(iso)).toEqual({ date: "2026-03-29", time: "12:15" });
  });

  it("el día se calcula en Madrid, no en UTC", () => {
    // 23:30 UTC del 31 de diciembre ya es 1 de enero en Madrid.
    expect(dayKey("2026-12-31T23:30:00Z")).toBe("2027-01-01");
  });

  it("la cuadrícula mensual empieza en lunes y cubre semanas completas", () => {
    const { days } = monthGridRange(2026, 9); // octubre 2026
    expect(days[0]).toBe("2026-09-28");
    expect(days.length % 7).toBe(0);
    expect(days).toContain("2026-10-31");
  });

  it("un evento de varios días ocupa todos sus días", () => {
    const keys = eventDayKeys(madridLocalToUtcIso("2026-10-18", "00:00"), madridLocalToUtcIso("2026-10-21", "23:59"));
    expect(keys).toEqual(["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21"]);
  });
});
