import { describe, expect, it } from "vitest";
import {
  hayCupoDisponible,
  haySuperposicionDeTurnos,
  puedeCancelarseConAnticipacion,
  tieneSuscripcionVigente,
} from "./reservas";

describe("tieneSuscripcionVigente", () => {
  const ahora = new Date("2026-10-03T12:00:00.000Z");

  it("funciona: hay una suscripción ACTIVA y no vencida", () => {
    const suscripciones = [{ estado: "ACTIVA" as const, fechaFin: new Date("2026-11-01T00:00:00.000Z") }];
    expect(tieneSuscripcionVigente(suscripciones, ahora)).toBe(true);
  });

  it("falla: la única suscripción está CANCELADA", () => {
    const suscripciones = [{ estado: "CANCELADA" as const, fechaFin: new Date("2026-11-01T00:00:00.000Z") }];
    expect(tieneSuscripcionVigente(suscripciones, ahora)).toBe(false);
  });

  it("borde: estado ACTIVA pero fechaFin ya pasó (desincronizado) igual cuenta como no vigente", () => {
    const suscripciones = [{ estado: "ACTIVA" as const, fechaFin: new Date("2026-09-01T00:00:00.000Z") }];
    expect(tieneSuscripcionVigente(suscripciones, ahora)).toBe(false);
  });
});

describe("hayCupoDisponible", () => {
  it("funciona: las confirmadas todavía no llegaron al máximo", () => {
    expect(hayCupoDisponible(10, 9)).toBe(true);
  });

  it("falla: las confirmadas superaron el máximo", () => {
    expect(hayCupoDisponible(10, 11)).toBe(false);
  });

  it("borde: no hay cupo apenas se alcanza el máximo exacto", () => {
    expect(hayCupoDisponible(10, 10)).toBe(false);
  });
});

describe("haySuperposicionDeTurnos", () => {
  // Misma fecha para todos los casos; lo que cambia es el horario.
  const fecha = new Date("2026-10-06T00:00:00.000Z");

  it("funciona: no hay superposición si los horarios no se tocan", () => {
    const existentes = [{ fecha, horaInicio: "18:00", horaFin: "19:00" }];
    const nueva = { fecha, horaInicio: "19:00", horaFin: "20:00" };
    expect(haySuperposicionDeTurnos(existentes, nueva)).toBe(false);
  });

  it("falla: los horarios se pisan en el medio", () => {
    const existentes = [{ fecha, horaInicio: "18:00", horaFin: "19:00" }];
    const nueva = { fecha, horaInicio: "18:30", horaFin: "19:30" };
    expect(haySuperposicionDeTurnos(existentes, nueva)).toBe(true);
  });

  it("borde: mismo horario pero otro día no superpone", () => {
    const otroDia = new Date("2026-10-07T00:00:00.000Z");
    const existentes = [{ fecha, horaInicio: "18:00", horaFin: "19:00" }];
    const nueva = { fecha: otroDia, horaInicio: "18:00", horaFin: "19:00" };
    expect(haySuperposicionDeTurnos(existentes, nueva)).toBe(false);
  });
});

describe("puedeCancelarseConAnticipacion", () => {
  // La clase empieza a las 18:00 del 2026-10-06.
  const fechaClase = new Date("2026-10-06T00:00:00.000Z");
  const horaInicio = "18:00";

  it("funciona: cancela a las 10:00, bastante más de 2hs antes", () => {
    const ahora = new Date("2026-10-06T10:00:00.000Z");
    expect(puedeCancelarseConAnticipacion(fechaClase, horaInicio, ahora)).toBe(true);
  });

  it("falla: intenta cancelar a las 17:30, media hora antes", () => {
    const ahora = new Date("2026-10-06T17:30:00.000Z");
    expect(puedeCancelarseConAnticipacion(fechaClase, horaInicio, ahora)).toBe(false);
  });

  it("borde: exactamente 2hs antes (16:00) todavía se puede cancelar", () => {
    const ahora = new Date("2026-10-06T16:00:00.000Z");
    expect(puedeCancelarseConAnticipacion(fechaClase, horaInicio, ahora)).toBe(true);
  });
});
