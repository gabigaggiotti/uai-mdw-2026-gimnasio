/**
 * Reglas de negocio de la entidad Reserva (docs/spec.md, sección 6).
 *
 * Sin Prisma, sin Next: reciben los datos que alguien más fue a buscar
 * (lib/db/reservas.ts) y devuelven un veredicto. Se prueban llamándolas
 * directamente, sin base y sin servidor (ver lib/reservas.test.ts).
 */
import { esSuscripcionVigente, type EstadoSuscripcion } from "./suscripciones";

/**
 * "Suscripción activa obligatoria": no se puede reservar sin al menos
 * una suscripción vigente (estado ACTIVA y fechaFin no vencida).
 */
export function tieneSuscripcionVigente(
  suscripciones: { estado: EstadoSuscripcion; fechaFin: Date }[],
  ahora: Date,
): boolean {
  return suscripciones.some((s) => esSuscripcionVigente(s, ahora));
}

/**
 * "Límite de capacidad": hay lugar si las reservas confirmadas para
 * esa clase y esa fecha todavía no llegaron al cupo máximo.
 */
export function hayCupoDisponible(cupoMaximo: number, reservasConfirmadas: number): boolean {
  return reservasConfirmadas < cupoMaximo;
}

/** Minutos desde medianoche de un horario "HH:MM". Para comparar rangos. */
function minutosDesdeMedianoche(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return (horas ?? 0) * 60 + (minutos ?? 0);
}

/** Dos fechas caen en el mismo día calendario (en UTC). */
function esMismoDia(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Dos rangos horarios [inicio, fin) se pisan en algún punto. */
function rangosSeSuperponen(
  inicioA: string,
  finA: string,
  inicioB: string,
  finB: string,
): boolean {
  const a1 = minutosDesdeMedianoche(inicioA);
  const a2 = minutosDesdeMedianoche(finA);
  const b1 = minutosDesdeMedianoche(inicioB);
  const b2 = minutosDesdeMedianoche(finB);
  return a1 < b2 && b1 < a2;
}

/**
 * "Sin superposición de turnos": un socio no puede reservar dos clases
 * que coincidan en el mismo día y rango horario, aunque sean clases
 * distintas.
 */
export function haySuperposicionDeTurnos(
  reservasExistentes: { fecha: Date; horaInicio: string; horaFin: string }[],
  nueva: { fecha: Date; horaInicio: string; horaFin: string },
): boolean {
  return reservasExistentes.some(
    (r) =>
      esMismoDia(r.fecha, nueva.fecha) &&
      rangosSeSuperponen(r.horaInicio, r.horaFin, nueva.horaInicio, nueva.horaFin),
  );
}

/**
 * "Cancelación anticipada": la cancelación solo se permite hasta
 * `horasDeAnticipacion` (2hs, por spec) antes del inicio de la clase.
 */
export function puedeCancelarseConAnticipacion(
  fechaClase: Date,
  horaInicioClase: string,
  ahora: Date,
  horasDeAnticipacion: number = 2,
): boolean {
  const [horas, minutos] = horaInicioClase.split(":").map(Number);
  const inicio = new Date(fechaClase);
  inicio.setUTCHours(horas ?? 0, minutos ?? 0, 0, 0);
  const limite = new Date(inicio.getTime() - horasDeAnticipacion * 60 * 60 * 1000);
  return ahora <= limite;
}
