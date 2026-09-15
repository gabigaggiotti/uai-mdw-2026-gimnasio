/**
 * Acceso a datos de la entidad Profesor.
 *
 * Dar de alta un profesor crea también su Usuario con rol PROFESOR: las
 * dos escrituras van en una transacción, para no terminar con un
 * Usuario sin perfil si la segunda falla.
 */
import { prisma } from "@/lib/db/client";
import type { CrearProfesorInput, EditarProfesorInput } from "@/lib/schemas/profesor";

const LIMITE_POR_DEFECTO = 50;

const SELECT_PROFESOR = {
  id: true,
  especialidad: true,
  telefono: true,
  activo: true,
  creadoEn: true,
  usuario: { select: { id: true, nombre: true, email: true } },
} as const;

export async function listarProfesores(limite: number = LIMITE_POR_DEFECTO) {
  return prisma.profesor.findMany({
    take: limite,
    orderBy: { creadoEn: "desc" },
    select: SELECT_PROFESOR,
  });
}

export async function obtenerProfesor(id: string) {
  return prisma.profesor.findUnique({ where: { id }, select: SELECT_PROFESOR });
}

export async function crearProfesor(datos: CrearProfesorInput) {
  const { email, nombre, especialidad, telefono } = datos;

  return prisma.profesor.create({
    data: {
      especialidad,
      telefono,
      usuario: {
        create: { email, nombre, rol: "PROFESOR" },
      },
    },
    select: SELECT_PROFESOR,
  });
}

export async function editarProfesor(id: string, datos: EditarProfesorInput) {
  return prisma.profesor.update({
    where: { id },
    data: datos,
    select: SELECT_PROFESOR,
  });
}

export async function eliminarProfesor(id: string) {
  // Prisma tira P2003 si el profesor tiene clases asociadas
  // (onDelete: Restrict en Clase.profesorId). El Route Handler traduce
  // ese error a un 409, no lo resuelve acá.
  return prisma.profesor.delete({ where: { id } });
}
