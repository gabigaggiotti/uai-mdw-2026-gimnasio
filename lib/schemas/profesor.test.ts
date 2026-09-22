import { describe, expect, it } from "vitest";
import { crearProfesorSchema, editarProfesorSchema } from "./profesor";

const PROFESOR_VALIDO = {
  email: "profesor@ejemplo.com",
  nombre: "Ana Gómez",
  especialidad: "Spinning",
};

describe("crearProfesorSchema", () => {
  it("acepta un profesor válido sin teléfono", () => {
    const resultado = crearProfesorSchema.safeParse(PROFESOR_VALIDO);
    expect(resultado.success).toBe(true);
  });

  it("rechaza un email inválido", () => {
    const resultado = crearProfesorSchema.safeParse({ ...PROFESOR_VALIDO, email: "no-es-un-email" });
    expect(resultado.success).toBe(false);
  });
});

describe("editarProfesorSchema", () => {
  it("rechaza un objeto vacío", () => {
    const resultado = editarProfesorSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta desactivar al profesor sin tocar el resto", () => {
    const resultado = editarProfesorSchema.safeParse({ activo: false });
    expect(resultado.success).toBe(true);
  });
});
