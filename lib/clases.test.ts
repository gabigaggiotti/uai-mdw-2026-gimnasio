import { describe, expect, it } from "vitest";
import { proximasFechas } from "./clases";

const iso = (fechas: Date[]) => fechas.map((f) => f.toISOString().slice(0, 10));

describe("proximasFechas", () => {
  // 2026-11-09 es lunes.
  const lunes = new Date("2026-11-09T15:00:00.000Z");

  it("no ofrece el día de hoy aunque sea el día de la clase", () => {
    expect(iso(proximasFechas("LUNES", lunes, 2))).toEqual(["2026-11-16", "2026-11-23"]);
  });

  it("ofrece mañana si la clase es mañana", () => {
    expect(iso(proximasFechas("MARTES", lunes, 1))).toEqual(["2026-11-10"]);
  });

  it("devuelve fechas semanales a medianoche UTC", () => {
    const fechas = proximasFechas("DOMINGO", lunes, 3);
    expect(iso(fechas)).toEqual(["2026-11-15", "2026-11-22", "2026-11-29"]);
    expect(fechas.every((f) => f.getUTCHours() === 0)).toBe(true);
  });

  it("cruza el fin de mes y de año", () => {
    const fin = new Date("2026-12-30T12:00:00.000Z"); // miércoles
    expect(iso(proximasFechas("VIERNES", fin, 2))).toEqual(["2027-01-01", "2027-01-08"]);
  });
});
