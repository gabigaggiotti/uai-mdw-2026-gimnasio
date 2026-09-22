import { describe, expect, it } from "vitest";
import { crearReservaSchema } from "./reserva";

const FECHA_FUTURA = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
const FECHA_PASADA = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

describe("crearReservaSchema", () => {
  it("acepta una reserva con fecha futura", () => {
    const resultado = crearReservaSchema.safeParse({
      claseId: "clx1a2b3c0000qzrm6ievzp2u",
      fecha: FECHA_FUTURA,
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza una reserva con fecha pasada", () => {
    // El caso borde que motivó el .refine(): no se puede reservar un
    // horario de clase que ya ocurrió.
    const resultado = crearReservaSchema.safeParse({
      claseId: "clx1a2b3c0000qzrm6ievzp2u",
      fecha: FECHA_PASADA,
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza un claseId que no tiene forma de cuid", () => {
    const resultado = crearReservaSchema.safeParse({ claseId: "123", fecha: FECHA_FUTURA });
    expect(resultado.success).toBe(false);
  });
});
