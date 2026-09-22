import { describe, expect, it } from "vitest";
import { crearCuotaSchema } from "./cuota";

const CUOTA_VALIDA = {
  suscripcionId: "clx1a2b3c0000qzrm6ievzp2u",
  fechaPago: "2026-09-01",
  modoPago: "EFECTIVO",
  monto: 15000,
  periodoCorrespondiente: "2026-09",
};

describe("crearCuotaSchema", () => {
  it("acepta una cuota válida", () => {
    const resultado = crearCuotaSchema.safeParse(CUOTA_VALIDA);
    expect(resultado.success).toBe(true);
  });

  it("rechaza una fecha de pago futura", () => {
    // No se puede registrar un pago que todavía no pasó.
    const fechaFutura = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const resultado = crearCuotaSchema.safeParse({ ...CUOTA_VALIDA, fechaPago: fechaFutura });

    expect(resultado.success).toBe(false);
  });

  it("rechaza un modoPago que no está en el enum", () => {
    const resultado = crearCuotaSchema.safeParse({ ...CUOTA_VALIDA, modoPago: "CRIPTO" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un monto negativo o cero", () => {
    const resultado = crearCuotaSchema.safeParse({ ...CUOTA_VALIDA, monto: 0 });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un periodoCorrespondiente con formato distinto a AAAA-MM", () => {
    const resultado = crearCuotaSchema.safeParse({
      ...CUOTA_VALIDA,
      periodoCorrespondiente: "09/2026",
    });

    expect(resultado.success).toBe(false);
  });
});
