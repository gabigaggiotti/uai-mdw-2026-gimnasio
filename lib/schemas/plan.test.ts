import { describe, expect, it } from "vitest";
import { crearPlanSchema, editarPlanSchema } from "./plan";

const PLAN_VALIDO = {
  nombre: "Plan Mensual",
  descripcion: "Acceso ilimitado a clases por 30 días.",
  precio: 15000,
  duracionDias: 30,
};

describe("crearPlanSchema", () => {
  it("acepta un plan válido", () => {
    const resultado = crearPlanSchema.safeParse(PLAN_VALIDO);
    expect(resultado.success).toBe(true);
  });

  it("rechaza un precio negativo o cero", () => {
    const resultado = crearPlanSchema.safeParse({ ...PLAN_VALIDO, precio: 0 });
    expect(resultado.success).toBe(false);
  });

  it("rechaza una duracionDias que no es entera", () => {
    const resultado = crearPlanSchema.safeParse({ ...PLAN_VALIDO, duracionDias: 30.5 });
    expect(resultado.success).toBe(false);
  });
});

describe("editarPlanSchema", () => {
  it("rechaza un objeto vacío", () => {
    const resultado = editarPlanSchema.safeParse({});
    expect(resultado.success).toBe(false);
  });

  it("acepta dar de baja el plan sin tocar el resto de los campos", () => {
    const resultado = editarPlanSchema.safeParse({ activo: false });
    expect(resultado.success).toBe(true);
  });
});
