/**
 * Reglas de negocio de la entidad Suscripcion (docs/spec.md, sección 6).
 *
 * Sin Prisma, sin Next.
 */

// Duplica los valores del enum EstadoSuscripcion de prisma/schema.prisma
// a propósito: esta capa no importa Prisma.
type EstadoSuscripcion = "ACTIVA" | "VENCIDA" | "CANCELADA";

/**
 * Una suscripción está vigente si su estado es ACTIVA **y** su
 * fechaFin todavía no pasó. Se comprueban las dos cosas (no alcanza
 * con el estado solo) porque `estado` depende de que algún proceso lo
 * actualice, y podría haber quedado desincronizado con la fecha real.
 */
export function esSuscripcionVigente(
  suscripcion: { estado: EstadoSuscripcion; fechaFin: Date },
  ahora: Date,
): boolean {
  return suscripcion.estado === "ACTIVA" && suscripcion.fechaFin >= ahora;
}

export type { EstadoSuscripcion };
