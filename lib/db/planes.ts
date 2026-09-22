/**
 * Acceso a datos de la entidad Plan.
 */
import { prisma } from "@/lib/db/client";
import type { CrearPlanInput, EditarPlanInput } from "@/lib/schemas/plan";

const LIMITE_POR_DEFECTO = 50;

export async function listarPlanes(limite: number = LIMITE_POR_DEFECTO) {
  return prisma.plan.findMany({
    take: limite,
    orderBy: { nombre: "asc" },
  });
}

export async function obtenerPlan(id: string) {
  return prisma.plan.findUnique({ where: { id } });
}

export async function crearPlan(datos: CrearPlanInput) {
  return prisma.plan.create({ data: datos });
}

export async function editarPlan(id: string, datos: EditarPlanInput) {
  return prisma.plan.update({ where: { id }, data: datos });
}

export async function eliminarPlan(id: string) {
  // Prisma tira P2003 si el plan tiene suscripciones asociadas
  // (onDelete: Restrict). El Route Handler lo traduce a 409.
  return prisma.plan.delete({ where: { id } });
}
