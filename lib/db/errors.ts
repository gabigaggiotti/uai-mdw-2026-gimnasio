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
