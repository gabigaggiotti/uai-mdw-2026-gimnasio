/**
 * Schemas de validación de la entidad Suscripcion.
 *
 * fechaFin no se pide: se calcula en el servidor a partir de
 * plan.duracionDias. estado tampoco: nace ACTIVA y cambia solo por las
 * acciones propias (pagar una cuota la extiende, cancelarla es su
 * propio endpoint).
 */
import { z } from "zod";

export const crearSuscripcionSchema = z.object({
  clienteId: z.string().cuid("clienteId no es válido"),
  planId: z.string().cuid("planId no es válido"),
  fechaInicio: z.coerce.date().optional(),
});

export type CrearSuscripcionInput = z.infer<typeof crearSuscripcionSchema>;
