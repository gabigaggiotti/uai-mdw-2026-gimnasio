/**
 * Acceso a datos de la entidad Ejercicio (catálogo).
 */
import { prisma } from "@/lib/db/client";
import type { CrearEjercicioInput, EditarEjercicioInput } from "@/lib/schemas/ejercicio";

const LIMITE_POR_DEFECTO = 100;

export async function listarEjercicios(limite: number = LIMITE_POR_DEFECTO) {
  return prisma.ejercicio.findMany({
    take: limite,
    orderBy: { nombre: "asc" },
  });
}

export async function obtenerEjercicio(id: string) {
  return prisma.ejercicio.findUnique({ where: { id } });
}

export async function crearEjercicio(datos: CrearEjercicioInput) {
  return prisma.ejercicio.create({ data: datos });
}

export async function editarEjercicio(id: string, datos: EditarEjercicioInput) {
  return prisma.ejercicio.update({ where: { id }, data: datos });
}

export async function eliminarEjercicio(id: string) {
  // Prisma tira P2003 si el ejercicio está en uso en alguna rutina
  // (onDelete: Restrict en RutinaEjercicio.ejercicioId).
  return prisma.ejercicio.delete({ where: { id } });
}
