import { describe, expect, it } from "vitest";
import { crearClaseSchema, editarClaseSchema } from "./clase";

const CLASE_VALIDA = {
  nombre: "Spinning",
  disciplina: "Cardio",
  profesorId: "clx1a2b3c0000qzrm6ievzp2u",
  diaSemana: "LUNES",
  horaInicio: "18:00",
  horaFin: "19:00",
  cupoMaximo: 20,
};

describe("crearClaseSchema", () => {
  it("acepta una clase válida", () => {
    const resultado = crearClaseSchema.safeParse(CLASE_VALIDA);
    expect(resultado.success).toBe(true);
  });

  it("rechaza un diaSemana que no es uno de los 7 valores", () => {
    const resultado = crearClaseSchema.safeParse({ ...CLASE_VALIDA, diaSemana: "FERIADO" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza horaInicio posterior a horaFin", () => {
    // El caso borde real: la clase no puede terminar antes de empezar.
    const resultado = crearClaseSchema.safeParse({
      ...CLASE_VALIDA,
      horaInicio: "20:00",
      horaFin: "19:00",
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza una hora con formato inválido", () => {
    const resultado = crearClaseSchema.safeParse({ ...CLASE_VALIDA, horaInicio: "6pm" });
    expect(resultado.success).toBe(false);
  });
});

describe("editarClaseSchema", () => {
  it("rechaza un objeto vacío", () => {
    // Sin este chequeo, un PATCH sin body pasaría la validación y
    // llegaría a Prisma como un update sin ningún campo.
    const resultado = editarClaseSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta editar un solo campo", () => {
    const resultado = editarClaseSchema.safeParse({ cupoMaximo: 25 });
    expect(resultado.success).toBe(true);
  });

  it("rechaza horaInicio posterior a horaFin aunque sea una edición parcial", () => {
    const resultado = editarClaseSchema.safeParse({ horaInicio: "20:00", horaFin: "19:00" });
    expect(resultado.success).toBe(false);
  });

  it("no compara horas si solo se edita una de las dos", () => {
    // Editar solo horaInicio no debería comparar contra un horaFin
    // que ni siquiera vino en este PATCH.
    const resultado = editarClaseSchema.safeParse({ horaInicio: "20:00" });
    expect(resultado.success).toBe(true);
  });
});
