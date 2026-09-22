import { describe, expect, it } from "vitest";
import { crearLesionSchema, editarLesionSchema } from "./lesion";

const LESION_VALIDA = {
  clienteId: "clx1a2b3c0000qzrm6ievzp2u",
  descripcion: "Dolor en la rodilla al sentadillear",
  zonaAfectada: "Rodilla",
  gravedad: "MODERADA",
};

describe("crearLesionSchema", () => {
  it("acepta una lesión válida", () => {
    const resultado = crearLesionSchema.safeParse(LESION_VALIDA);
    expect(resultado.success).toBe(true);
  });

  it("rechaza una gravedad que no está en el enum", () => {
    const resultado = crearLesionSchema.safeParse({ ...LESION_VALIDA, gravedad: "CATASTROFICA" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una zonaAfectada vacía", () => {
    const resultado = crearLesionSchema.safeParse({ ...LESION_VALIDA, zonaAfectada: "" });
    expect(resultado.success).toBe(false);
  });
});

describe("editarLesionSchema", () => {
  it("rechaza un objeto vacío", () => {
    const resultado = editarLesionSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta corregir solo las observaciones", () => {
    const resultado = editarLesionSchema.safeParse({ observaciones: "Mejoró con reposo" });
    expect(resultado.success).toBe(true);
  });
});
