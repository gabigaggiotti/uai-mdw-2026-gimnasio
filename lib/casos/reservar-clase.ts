/**
 * Caso de uso: un cliente reserva un lugar en una clase.
 *
 * Tiene dos puertas —POST /api/reservas y la Server Action del detalle de
 * la clase— y las reglas viven acá una sola vez. No sabe que existe HTTP
 * ni que existen los formularios: devuelve un resultado con un motivo de
 * un conjunto cerrado, y cada puerta lo traduce (a un status o a un
 * mensaje arriba del formulario).
 */
import type { UsuarioSesion } from "@/lib/auth";
import type { CrearReservaInput } from "@/lib/schemas/reserva";
import { obtenerClase } from "@/lib/db/clases";
import { crearReserva } from "@/lib/db/reservas";
import {
  CupoAgotadoError,
  SinSuscripcionVigenteError,
  SuperposicionDeTurnosError,
} from "@/lib/db/errors";
import { enviarConfirmacionDeReserva } from "@/lib/servicios/correo";
import { formatearDia } from "@/lib/utils";

export type MotivoRechazoReserva =
  | "CLASE_INEXISTENTE"
  | "SIN_SUSCRIPCION"
  | "SUPERPOSICION"
  | "SIN_CUPO";

// Record y no un switch: el día que aparezca un motivo nuevo, el proyecto
// deja de compilar hasta que alguien escriba su mensaje.
export const MENSAJE_RECHAZO_RESERVA: Record<MotivoRechazoReserva, string> = {
  CLASE_INEXISTENTE: "No encontrado",
  SIN_SUSCRIPCION: new SinSuscripcionVigenteError().message,
  SUPERPOSICION: new SuperposicionDeTurnosError().message,
  SIN_CUPO: new CupoAgotadoError().message,
};

type ReservaCreada = Awaited<ReturnType<typeof crearReserva>>;

export type ResultadoReserva =
  | { ok: true; reserva: ReservaCreada; confirmacionEnviada: boolean }
  | { ok: false; motivo: MotivoRechazoReserva };

export async function reservarClase(
  datos: CrearReservaInput,
  cliente: UsuarioSesion,
): Promise<ResultadoReserva> {
  const clase = await obtenerClase(datos.claseId);
  if (!clase) return { ok: false, motivo: "CLASE_INEXISTENTE" };

  let reserva: ReservaCreada;
  try {
    reserva = await crearReserva(datos, cliente.id);
  } catch (error) {
    if (error instanceof SinSuscripcionVigenteError) return { ok: false, motivo: "SIN_SUSCRIPCION" };
    if (error instanceof SuperposicionDeTurnosError) return { ok: false, motivo: "SUPERPOSICION" };
    if (error instanceof CupoAgotadoError) return { ok: false, motivo: "SIN_CUPO" };
    throw error; // cualquier otra cosa es un bug o la base caída: 500
  }

  // A partir de acá la reserva YA ESTÁ CONFIRMADA. El mail es accesorio
  // (docs/spec.md, sección 8): si el proveedor falla o tarda, la función
  // devuelve false y la reserva sigue en pie. Nada de lo que sigue lanza.
  const confirmacionEnviada = await enviarConfirmacionDeReserva({
    para: cliente.email,
    nombre: cliente.nombre,
    clase: clase.nombre,
    fecha: formatearDia(reserva.fecha),
    horaInicio: clase.horaInicio,
    horaFin: clase.horaFin,
  });

  return { ok: true, reserva, confirmacionEnviada };
}
