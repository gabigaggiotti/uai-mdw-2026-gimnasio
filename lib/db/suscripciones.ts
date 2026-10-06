/**
 * Acceso a datos de la entidad Suscripcion.
 *
 * fechaFin se calcula en el servidor a partir de plan.duracionDias: el
 * cliente nunca la manda, para que no pueda regalarse una suscripción
 * más larga que la del plan que contrató.
 */
import { prisma } from "@/lib/db/client";
import type { CrearSuscripcionInput } from "@/lib/schemas/suscripcion";

const LIMITE_POR_DEFECTO = 50;

export async function listarSuscripcionesDeCliente(clienteId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.suscripcion.findMany({
    where: { clienteId },
    take: limite,
    orderBy: { creadaEn: "desc" },
    include: { plan: { select: { id: true, nombre: true, precio: true } } },
  });
}

export async function obtenerSuscripcion(id: string, clienteId?: string) {
  return prisma.suscripcion.findFirst({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    include: { plan: true, cuotas: { orderBy: { fechaPago: "desc" } } },
  });
}

export async function crearSuscripcion(datos: CrearSuscripcionInput) {
  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: datos.planId } });
  const fechaInicio = datos.fechaInicio ?? new Date();
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + plan.duracionDias);

  return prisma.suscripcion.create({
    data: {
      clienteId: datos.clienteId,
      planId: datos.planId,
      fechaInicio,
      fechaFin,
    },
  });
}

export async function cancelarSuscripcion(id: string, clienteId?: string) {
  const actualizada = await prisma.suscripcion.updateMany({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    data: { estado: "CANCELADA" },
  });

  if (actualizada.count === 0) return null;
  return obtenerSuscripcion(id, clienteId);
}
