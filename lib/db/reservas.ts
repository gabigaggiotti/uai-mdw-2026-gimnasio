/**
 * Acceso a datos de la entidad Reserva.
 *
 * crearReserva trae la suscripción del cliente, sus reservas vigentes
 * y la clase, y le pregunta a lib/reservas.ts (funciones puras, sin
 * Prisma) si con esos datos la reserva es válida. La lectura y la
 * escritura van en una transacción para que dos reservas simultáneas
 * no pasen las dos el chequeo de cupo y lo sobrepasen.
 */
import { prisma } from "@/lib/db/client";
import type { CrearReservaInput } from "@/lib/schemas/reserva";
import {
  CancelacionFueraDeTiempoError,
  CupoAgotadoError,
  SinSuscripcionVigenteError,
  SuperposicionDeTurnosError,
} from "@/lib/db/errors";
import {
  hayCupoDisponible,
  haySuperposicionDeTurnos,
  puedeCancelarseConAnticipacion,
  tieneSuscripcionVigente,
} from "@/lib/reservas";

const LIMITE_POR_DEFECTO = 50;

export async function listarReservasDeCliente(clienteId: string, limite: number = LIMITE_POR_DEFECTO) {
  return prisma.reserva.findMany({
    where: { clienteId },
    take: limite,
    orderBy: { fecha: "desc" },
    include: { clase: { select: { id: true, nombre: true, horaInicio: true, horaFin: true } } },
  });
}

export async function obtenerReserva(id: string, clienteId?: string) {
  return prisma.reserva.findFirst({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    include: { clase: true },
  });
}

export async function crearReserva(datos: CrearReservaInput, clienteId: string) {
  return prisma.$transaction(async (tx) => {
    const clase = await tx.clase.findUniqueOrThrow({ where: { id: datos.claseId } });

    const suscripciones = await tx.suscripcion.findMany({
      where: { clienteId },
      select: { estado: true, fechaFin: true },
    });

    if (!tieneSuscripcionVigente(suscripciones, new Date())) {
      throw new SinSuscripcionVigenteError();
    }

    const reservasDelCliente = await tx.reserva.findMany({
      where: { clienteId, estado: "CONFIRMADA" },
      select: { fecha: true, clase: { select: { horaInicio: true, horaFin: true } } },
    });

    const turnosExistentes = reservasDelCliente.map((r) => ({
      fecha: r.fecha,
      horaInicio: r.clase.horaInicio,
      horaFin: r.clase.horaFin,
    }));
    const turnoNuevo = { fecha: datos.fecha, horaInicio: clase.horaInicio, horaFin: clase.horaFin };

    if (haySuperposicionDeTurnos(turnosExistentes, turnoNuevo)) {
      throw new SuperposicionDeTurnosError();
    }

    const confirmadas = await tx.reserva.count({
      where: { claseId: datos.claseId, fecha: datos.fecha, estado: "CONFIRMADA" },
    });

    if (!hayCupoDisponible(clase.cupoMaximo, confirmadas)) {
      throw new CupoAgotadoError();
    }

    return tx.reserva.create({
      data: { clienteId, claseId: datos.claseId, fecha: datos.fecha },
    });
  });
}

export async function cancelarReserva(id: string, clienteId?: string) {
  const reserva = await prisma.reserva.findFirst({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    select: { fecha: true, clase: { select: { horaInicio: true } } },
  });

  if (!reserva) return null;

  if (!puedeCancelarseConAnticipacion(reserva.fecha, reserva.clase.horaInicio, new Date())) {
    throw new CancelacionFueraDeTiempoError();
  }

  // No es un PATCH { estado: "CANCELADA" }: además de cambiar el estado,
  // libera el cupo (que se recalcula contando CONFIRMADA, así que
  // cancelar ya lo libera solo) y registra cuándo se canceló.
  const actualizada = await prisma.reserva.updateMany({
    where: { id, ...(clienteId ? { clienteId } : {}) },
    data: { estado: "CANCELADA", canceladaEn: new Date() },
  });

  if (actualizada.count === 0) return null;
  return obtenerReserva(id, clienteId);
}
