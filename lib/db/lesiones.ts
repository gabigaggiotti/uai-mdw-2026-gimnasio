/**
 * Acceso a datos de la entidad Lesion.
 */
import { prisma } from "@/lib/db/client";
import type { CrearLesionInput, EditarLesionInput } from "@/lib/schemas/lesion";

const LIMITE_POR_DEFECTO = 50;

export async function listarLesionesDeCliente(clienteId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.lesion.findMany({
    where: { clienteId },
    take: limite,
    orderBy: { fechaRegistro: "desc" },
  });
}

export async function obtenerLesion(id: string) {
  return prisma.lesion.findUnique({ where: { id } });
}

export async function crearLesion(datos: CrearLesionInput) {
  return prisma.lesion.create({ data: datos });
}

export async function editarLesion(id: string, datos: EditarLesionInput) {
  return prisma.lesion.update({ where: { id }, data: datos });
}

export async function marcarLesionRecuperada(id: string) {
  return prisma.lesion.update({ where: { id }, data: { estado: "RECUPERADA" } });
}
