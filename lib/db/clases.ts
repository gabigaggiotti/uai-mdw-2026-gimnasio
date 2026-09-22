/**
 * Acceso a datos de la entidad Clase.
 */
import { prisma } from "@/lib/db/client";
import type { CrearClaseInput, EditarClaseInput } from "@/lib/schemas/clase";
import type { DiaSemana } from "@prisma/client";

const LIMITE_POR_DEFECTO = 100;

export async function listarClases(diaSemana?: DiaSemana, limite: number = LIMITE_POR_DEFECTO) {
  // La grilla semanal completa: filtrar por día es opcional, filtrar por
  // clase inactiva no — nunca se muestra una clase dada de baja.
  return prisma.clase.findMany({
    where: { activa: true, ...(diaSemana ? { diaSemana } : {}) },
    take: limite,
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    include: { profesor: { select: { id: true, usuario: { select: { nombre: true } } } } },
  });
}

export async function obtenerClase(id: string) {
  return prisma.clase.findUnique({
    where: { id },
    include: { profesor: { select: { id: true, usuario: { select: { nombre: true } } } } },
  });
}

export async function crearClase(datos: CrearClaseInput) {
  return prisma.clase.create({ data: datos });
}

export async function editarClase(id: string, datos: EditarClaseInput) {
  return prisma.clase.update({ where: { id }, data: datos });
}

export async function eliminarClase(id: string) {
  // Prisma tira P2003 si la clase tiene reservas asociadas
  // (onDelete: Restrict). El Route Handler lo traduce a 409: en ese caso
  // corresponde desactivarla (activa: false), no borrarla.
  return prisma.clase.delete({ where: { id } });
}

/**
 * Cuántos lugares confirmados tiene una clase para una fecha puntual.
 * Lo usa `crearReserva` (lib/db/reservas.ts) para decidir si hay cupo:
 * vive acá porque es una consulta sobre Clase + Reserva, no una regla
 * de Reserva en sí misma.
 */
export async function contarReservasConfirmadas(claseId: string, fecha: Date) {
  return prisma.reserva.count({
    where: { claseId, fecha, estado: "CONFIRMADA" },
  });
}
