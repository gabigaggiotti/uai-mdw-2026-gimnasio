/**
 * Acceso a datos de la entidad Lesion.
 */
import { prisma } from "@/lib/db/client";
import type { CrearLesionInput, EditarLesionInput } from "@/lib/schemas/lesion";

const LIMITE_POR_DEFECTO = 50;

export async function listarLesionesDeCliente(
  clienteId?: string,
  limite: number = LIMITE_POR_DEFECTO,
) {
  return prisma.lesion.findMany({
    where: clienteId ? { clienteId } : {},
    take: limite,
    orderBy: { fechaRegistro: "desc" },
  });
}

export async function obtenerLesion(id: string, clienteId?: string) {
  return prisma.lesion.findFirst({ where: { id, ...(clienteId ? { clienteId } : {}) } });
}

export async function crearLesion(datos: CrearLesionInput) {
  return prisma.lesion.create({ data: datos });
}

export async function editarLesion(id: string, datos: EditarLesionInput, clienteId?: string) {
  const actualizada = await prisma.lesion.updateMany({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    data: datos,
  });
  if (actualizada.count === 0) return null;
  return obtenerLesion(id, clienteId);
}

export async function marcarLesionRecuperada(id: string, clienteId?: string) {
  const actualizada = await prisma.lesion.updateMany({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    data: { estado: "RECUPERADA" },
  });
  if (actualizada.count === 0) return null;
  return obtenerLesion(id, clienteId);
}
