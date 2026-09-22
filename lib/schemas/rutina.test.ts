import { describe, expect, it } from "vitest";
import { crearRutinaSchema, editarRutinaSchema } from "./rutina";

describe("crearRutinaSchema", () => {
  it("acepta una rutina válida", () => {
    const resultado = crearRutinaSchema.safeParse({
      clienteId: "clx1a2b3c0000qzrm6ievzp2u",
      nombre: "Rutina de fuerza",
    });

    expect(resultado.success).toBe(true);
  });

  it("no acepta que el cliente mande el estado inicial", () => {
    // estado no es parte del schema: toda rutina nace INACTIVA, no lo
    // decide quien la crea. Zod ignora la clave desconocida por
    // defecto, así que lo que importa es que el resultado siga siendo
    // válido sin ella.
    const resultado = crearRutinaSchema.safeParse({
      clienteId: "clx1a2b3c0000qzrm6ievzp2u",
      nombre: "Rutina de fuerza",
      estado: "ACTIVA",
    });

    expect(resultado.success && !("estado" in resultado.data)).toBe(true);
  });
});

describe("editarRutinaSchema", () => {
  it("rechaza un nombre demasiado corto", () => {
    const resultado = editarRutinaSchema.safeParse({ nombre: "ab" });
    expect(resultado.success).toBe(false);
  });
});
