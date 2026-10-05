import { describe, expect, it } from "vitest";
import { esSuscripcionVigente } from "./suscripciones";

describe("esSuscripcionVigente", () => {
  const ahora = new Date("2026-10-03T12:00:00.000Z");

  it("funciona: ACTIVA y con fechaFin futura", () => {
    const suscripcion = { estado: "ACTIVA" as const, fechaFin: new Date("2026-11-01T00:00:00.000Z") };
    expect(esSuscripcionVigente(suscripcion, ahora)).toBe(true);
  });

  it("falla: VENCIDA, aunque fechaFin sea futura", () => {
    const suscripcion = { estado: "VENCIDA" as const, fechaFin: new Date("2026-11-01T00:00:00.000Z") };
    expect(esSuscripcionVigente(suscripcion, ahora)).toBe(false);
  });

  it("borde: ACTIVA con fechaFin exactamente igual a ahora todavía cuenta como vigente", () => {
    const suscripcion = { estado: "ACTIVA" as const, fechaFin: ahora };
    expect(esSuscripcionVigente(suscripcion, ahora)).toBe(true);
  });
});
