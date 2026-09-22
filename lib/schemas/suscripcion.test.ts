import { describe, expect, it } from "vitest";
import { crearSuscripcionSchema } from "./suscripcion";

describe("crearSuscripcionSchema", () => {
  it("acepta una suscripción sin fechaInicio (usa la de hoy)", () => {
    const resultado = crearSuscripcionSchema.safeParse({
      clienteId: "clx1a2b3c0000qzrm6ievzp2u",
      planId: "clx1a2b3c0000qzrm6ievzp2u",
    });

    expect(resultado.success).toBe(true);
  });

  it("acepta una fechaInicio explícita", () => {
    const resultado = crearSuscripcionSchema.safeParse({
      clienteId: "clx1a2b3c0000qzrm6ievzp2u",
      planId: "clx1a2b3c0000qzrm6ievzp2u",
      fechaInicio: "2026-10-01",
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza un planId que no tiene forma de cuid", () => {
    const resultado = crearSuscripcionSchema.safeParse({
      clienteId: "clx1a2b3c0000qzrm6ievzp2u",
      planId: "no-es-un-cuid-válido!!",
    });

    expect(resultado.success).toBe(false);
  });
});
