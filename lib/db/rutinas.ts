/**
 * Acceso a datos de las entidades Rutina y RutinaEjercicio.
 *
 * activarRutina es la operación con regla propia: activar una rutina
 * desactiva automáticamente la que estaba activa antes, porque un
 * cliente tiene una sola rutina ACTIVA a la vez. Las dos escrituras van
 * en una transacción para que nunca queden dos activas ni ninguna.
 */
import { prisma } from "@/lib/db/client";
import type { CrearRutinaInput, EditarRutinaInput } from "@/lib/schemas/rutina";
import type {
  AgregarEjercicioARutinaInput,
  EditarEjercicioDeRutinaInput,
} from "@/lib/schemas/rutinaEjercicio";

const LIMITE_POR_DEFECTO = 50;

const INCLUDE_EJERCICIOS = {
  ejercicios: {
    orderBy: { orden: "asc" as const },
    include: { ejercicio: true },
  },
};

export async function listarRutinasDeCliente(
  clienteId?: string,
  limite: number = LIMITE_POR_DEFECTO,
) {
  return prisma.rutina.findMany({
    where: clienteId ? { clienteId } : {},
    take: limite,
    orderBy: { creadaEn: "desc" },
  });
}

export async function obtenerRutinaConEjercicios(id: string, clienteId?: string) {
  return prisma.rutina.findFirst({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    include: INCLUDE_EJERCICIOS,
  });
}

export async function crearRutina(datos: CrearRutinaInput) {
  return prisma.rutina.create({ data: datos });
}

export async function editarRutina(id: string, datos: EditarRutinaInput) {
  return prisma.rutina.update({ where: { id }, data: datos });
}

export async function activarRutina(id: string, clienteId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.rutina.updateMany({
      where: { clienteId, estado: "ACTIVA" },
      data: { estado: "INACTIVA" },
    });

    const activada = await tx.rutina.updateMany({
      where: { id, clienteId },
      data: { estado: "ACTIVA" },
    });
    if (activada.count === 0) return null;
    return tx.rutina.findFirst({ where: { id, clienteId } });
  });
}

export async function eliminarRutina(id: string) {
  return prisma.rutina.delete({ where: { id } });
}

export async function agregarEjercicioARutina(rutinaId: string, datos: AgregarEjercicioARutinaInput) {
  return prisma.rutinaEjercicio.create({ data: { rutinaId, ...datos } });
}

export async function editarEjercicioDeRutina(
  rutinaId: string,
  rutinaEjercicioId: string,
  datos: EditarEjercicioDeRutinaInput,
) {
  const actualizada = await prisma.rutinaEjercicio.updateMany({
    where: { id: rutinaEjercicioId, rutinaId },
    data: datos,
  });
  if (actualizada.count === 0) return null;
  return prisma.rutinaEjercicio.findFirst({ where: { id: rutinaEjercicioId, rutinaId } });
}

export async function quitarEjercicioDeRutina(rutinaId: string, rutinaEjercicioId: string) {
  const eliminado = await prisma.rutinaEjercicio.deleteMany({
    where: { id: rutinaEjercicioId, rutinaId },
  });
  return eliminado.count > 0;
}
