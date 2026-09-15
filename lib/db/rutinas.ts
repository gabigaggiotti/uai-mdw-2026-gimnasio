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

export async function listarRutinasDeCliente(clienteId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.rutina.findMany({
    where: { clienteId },
    take: limite,
    orderBy: { creadaEn: "desc" },
  });
}

export async function obtenerRutinaConEjercicios(id: string) {
  return prisma.rutina.findUnique({ where: { id }, include: INCLUDE_EJERCICIOS });
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

    return tx.rutina.update({ where: { id }, data: { estado: "ACTIVA" } });
  });
}

export async function eliminarRutina(id: string) {
  return prisma.rutina.delete({ where: { id } });
}

export async function agregarEjercicioARutina(rutinaId: string, datos: AgregarEjercicioARutinaInput) {
  return prisma.rutinaEjercicio.create({ data: { rutinaId, ...datos } });
}

export async function editarEjercicioDeRutina(rutinaEjercicioId: string, datos: EditarEjercicioDeRutinaInput) {
  return prisma.rutinaEjercicio.update({ where: { id: rutinaEjercicioId }, data: datos });
}

export async function quitarEjercicioDeRutina(rutinaEjercicioId: string) {
  return prisma.rutinaEjercicio.delete({ where: { id: rutinaEjercicioId } });
}
