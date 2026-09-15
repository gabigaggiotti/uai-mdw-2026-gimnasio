/**
 * Acceso a datos de la entidad Reserva.
 *
 * crearReserva es la operación que no es un simple insert: verifica
 * cupo disponible antes de escribir. La verificación y la escritura van
 * en una transacción para que dos reservas simultáneas no pasen las dos
 * el chequeo y sobrepasen el cupo.
 */
import { prisma } from "@/lib/db/client";
import type { CrearReservaInput } from "@/lib/schemas/reserva";
import { CupoAgotadoError } from "@/lib/db/errors";

const LIMITE_POR_DEFECTO = 50;

export async function listarReservasDeCliente(clienteId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.reserva.findMany({
    where: { clienteId },
    take: limite,
    orderBy: { fecha: "desc" },
    include: { clase: { select: { id: true, nombre: true, horaInicio: true, horaFin: true } } },
  });
}

export async function obtenerReserva(id: string) {
  return prisma.reserva.findUnique({
    where: { id },
    include: { clase: true },
  });
}

export async function crearReserva(datos: CrearReservaInput, clienteId: string) {
  return prisma.$transaction(async (tx) => {
    const clase = await tx.clase.findUniqueOrThrow({ where: { id: datos.claseId } });

    const confirmadas = await tx.reserva.count({
      where: { claseId: datos.claseId, fecha: datos.fecha, estado: "CONFIRMADA" },
    });

    if (confirmadas >= clase.cupoMaximo) {
      throw new CupoAgotadoError();
    }

    return tx.reserva.create({
      data: { clienteId, claseId: datos.claseId, fecha: datos.fecha },
    });
  });
}

export async function cancelarReserva(id: string) {
  // No es un PATCH { estado: "CANCELADA" }: además de cambiar el estado,
  // libera el cupo (que se recalcula contando CONFIRMADA, así que
  // cancelar ya lo libera solo) y registra cuándo se canceló.
  return prisma.reserva.update({
    where: { id },
    data: { estado: "CANCELADA", canceladaEn: new Date() },
  });
}
