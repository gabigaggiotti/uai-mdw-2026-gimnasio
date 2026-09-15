/**
 * Acceso a datos de la entidad Cuota.
 *
 * registrarCuota es la segunda operación con una regla propia además
 * del insert: pagar una cuota extiende fechaFin de la Suscripcion en
 * plan.duracionDias. Las dos escrituras van en una transacción.
 */
import { prisma } from "@/lib/db/client";
import type { CrearCuotaInput } from "@/lib/schemas/cuota";

const LIMITE_POR_DEFECTO = 50;

export async function listarCuotasDeSuscripcion(suscripcionId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.cuota.findMany({
    where: { suscripcionId },
    take: limite,
    orderBy: { fechaPago: "desc" },
  });
}

export async function obtenerCuota(id: string) {
  return prisma.cuota.findUnique({ where: { id } });
}

export async function registrarCuota(datos: CrearCuotaInput) {
  return prisma.$transaction(async (tx) => {
    const suscripcion = await tx.suscripcion.findUniqueOrThrow({
      where: { id: datos.suscripcionId },
      include: { plan: true },
    });

    const cuota = await tx.cuota.create({ data: datos });

    const fechaFinExtendida = new Date(suscripcion.fechaFin);
    fechaFinExtendida.setDate(fechaFinExtendida.getDate() + suscripcion.plan.duracionDias);

    await tx.suscripcion.update({
      where: { id: suscripcion.id },
      data: { fechaFin: fechaFinExtendida, estado: "ACTIVA" },
    });

    return cuota;
  });
}
