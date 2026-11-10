/**
 * Reglas de la grilla semanal (sin Prisma, sin Next).
 *
 * Una Clase se repite todas las semanas en su diaSemana; una Reserva es
 * un lugar en una fecha puntual de esa clase. Estas funciones reciben el
 * "hoy" por parámetro para poder probarse sin congelar el reloj.
 */

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

// Mismo orden que Date#getUTCDay(): 0 es domingo.
const INDICE_DIA: Record<DiaSemana, number> = {
  DOMINGO: 0,
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

export const NOMBRE_DIA: Record<DiaSemana, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

/**
 * Las próximas `cantidad` fechas (medianoche UTC) en que se dicta una
 * clase, empezando por mañana. Hoy no se ofrece porque la API rechaza
 * reservar una fecha que ya empezó.
 */
export function proximasFechas(diaSemana: DiaSemana, hoy: Date, cantidad: number = 4): Date[] {
  const manana = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() + 1));
  const diasHastaLaPrimera = (INDICE_DIA[diaSemana] - manana.getUTCDay() + 7) % 7;

  return Array.from({ length: cantidad }, (_, semana) => {
    const fecha = new Date(manana);
    fecha.setUTCDate(manana.getUTCDate() + diasHastaLaPrimera + semana * 7);
    return fecha;
  });
}
