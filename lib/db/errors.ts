/**
 * Errores de dominio que puede lanzar `lib/db/`.
 *
 * Existen para que el Route Handler pueda distinguir "esto es una regla
 * de negocio violada" (mapea a 409) de un error real del servidor
 * (mapea a 500), sin parsear el texto del mensaje.
 */
export class CupoAgotadoError extends Error {
  constructor(message: string = "No hay cupo disponible para esta clase") {
    super(message);
    this.name = "CupoAgotadoError";
  }
}

export class SinSuscripcionVigenteError extends Error {
  constructor(message: string = "Necesitás una suscripción o cuota activa para reservar") {
    super(message);
    this.name = "SinSuscripcionVigenteError";
  }
}

export class SuperposicionDeTurnosError extends Error {
  constructor(message: string = "Ya tenés una reserva ese día en ese mismo horario") {
    super(message);
    this.name = "SuperposicionDeTurnosError";
  }
}

export class CancelacionFueraDeTiempoError extends Error {
  constructor(message: string = "Ya no se puede cancelar: faltan menos de 2 horas para la clase") {
    super(message);
    this.name = "CancelacionFueraDeTiempoError";
  }
}
