import { describe, expect, it } from "vitest";
import { agregarEjercicioARutinaSchema, editarEjercicioDeRutinaSchema } from "./rutinaEjercicio";

describe("agregarEjercicioARutinaSchema", () => {
  it("acepta un ítem de rutina válido", () => {
    const resultado = agregarEjercicioARutinaSchema.safeParse({
      ejercicioId: "clx1a2b3c0000qzrm6ievzp2u",
      series: 4,
      repeticiones: 12,
      orden: 0,
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza series en 0", () => {
    const resultado = agregarEjercicioARutinaSchema.safeParse({
      ejercicioId: "clx1a2b3c0000qzrm6ievzp2u",
      series: 0,
      repeticiones: 12,
      orden: 0,
    });

    expect(resultado.success).toBe(false);
  });

  it("acepta orden en 0 (el primer ejercicio de la rutina)", () => {
    // Caso borde: nonnegative() tiene que aceptar 0, a diferencia de
    // series/repeticiones que usan positive().
    const resultado = agregarEjercicioARutinaSchema.safeParse({
      ejercicioId: "clx1a2b3c0000qzrm6ievzp2u",
      series: 4,
      repeticiones: 12,
      orden: 0,
    });

    expect(resultado.success).toBe(true);
  });
});

describe("editarEjercicioDeRutinaSchema", () => {
  it("rechaza un objeto vacío", () => {
    const resultado = editarEjercicioDeRutinaSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta reordenar sin tocar series ni repeticiones", () => {
    const resultado = editarEjercicioDeRutinaSchema.safeParse({ orden: 2 });
    expect(resultado.success).toBe(true);
  });
});
