import { describe, expect, it } from "vitest";
import { crearEjercicioSchema, editarEjercicioSchema } from "./ejercicio";

describe("crearEjercicioSchema", () => {
  it("acepta un ejercicio válido sin descripción", () => {
    const resultado = crearEjercicioSchema.safeParse({
      nombre: "Sentadilla",
      grupoMuscular: "Piernas",
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza un nombre demasiado corto", () => {
    const resultado = crearEjercicioSchema.safeParse({ nombre: "ab", grupoMuscular: "Piernas" });
    expect(resultado.success).toBe(false);
  });
});

describe("editarEjercicioSchema", () => {
  it("rechaza un objeto vacío", () => {
    const resultado = editarEjercicioSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta editar un solo campo", () => {
    const resultado = editarEjercicioSchema.safeParse({ grupoMuscular: "Espalda" });
    expect(resultado.success).toBe(true);
  });
});
