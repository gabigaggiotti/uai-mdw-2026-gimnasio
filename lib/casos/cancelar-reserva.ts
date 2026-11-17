/**
 * Caso de uso: cancelar una reserva.
 *
 * Dos puertas: POST /api/reservas/:id/cancelacion y la Server Action del
 * detalle de la reserva. `clienteId` viene de la sesión cuando quien
 * cancela es un CLIENTE (filtra por pertenencia) y es undefined para un
 * ADMINISTRADOR (alcance global), igual que en lib/db/reservas.ts.
 */
import { cancelarReserva, obtenerReserva } from "@/lib/db/reservas";
import { CancelacionFueraDeTiempoError, ReservaYaCanceladaError } from "@/lib/db/errors";

export type MotivoRechazoCancelacion = "NO_ENCONTRADA" | "YA_CANCELADA" | "FUERA_DE_TIEMPO";

export const MENSAJE_RECHAZO_CANCELACION: Record<MotivoRechazoCancelacion, string> = {
  NO_ENCONTRADA: "No encontrado",
  YA_CANCELADA: new ReservaYaCanceladaError().message,
  FUERA_DE_TIEMPO: new CancelacionFueraDeTiempoError().message,
};

type ReservaCancelada = NonNullable<Awaited<ReturnType<typeof cancelarReserva>>>;

export type ResultadoCancelacion =
  | { ok: true; reserva: ReservaCancelada }
  | { ok: false; motivo: MotivoRechazoCancelacion };

export async function cancelarReservaDe(
  id: string,
  clienteId: string | undefined,
): Promise<ResultadoCancelacion> {
  const reserva = await obtenerReserva(id, clienteId);
  if (!reserva) return { ok: false, motivo: "NO_ENCONTRADA" };
  // Atajo para el caso común (alguien vuelve a una reserva ya cancelada).
  // NO alcanza con dos pedidos simultáneos: lo garantiza el where del
  // UPDATE en lib/db/reservas.ts, que lanza ReservaYaCanceladaError.
  if (reserva.estado === "CANCELADA") return { ok: false, motivo: "YA_CANCELADA" };

  try {
    const cancelada = await cancelarReserva(id, clienteId);
    if (!cancelada) return { ok: false, motivo: "NO_ENCONTRADA" };
    return { ok: true, reserva: cancelada };
  } catch (error) {
    if (error instanceof CancelacionFueraDeTiempoError) return { ok: false, motivo: "FUERA_DE_TIEMPO" };
    if (error instanceof ReservaYaCanceladaError) return { ok: false, motivo: "YA_CANCELADA" };
    throw error;
  }
}
