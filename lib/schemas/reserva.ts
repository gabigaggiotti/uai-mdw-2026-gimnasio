/**
 * Schemas de validación de la entidad Reserva.
 *
 * clienteId no se pide acá: sale de la sesión, nunca del body (ver
 * AGENTS.md, sección Seguridad — no confiar en un userId que venga del
 * cliente). estado tampoco: al crear siempre nace CONFIRMADA, y las
 * transiciones (cancelación) son su propio endpoint sin body.
 *
 * fecha se valida con .refine() y no con .min(new Date()), porque ese
 * new Date() de un .min() se evalúa al construir el schema y queda
 * congelado al arrancar el servidor.
 */
import { z } from "zod";

export const crearReservaSchema = z.object({
  claseId: z.string().cuid("claseId no es válido"),
  fecha: z
    .coerce
    .date()
    .refine((fecha) => fecha.getTime() > Date.now(), {
      message: "No se puede reservar una fecha pasada",
    }),
});

export type CrearReservaInput = z.infer<typeof crearReservaSchema>;
