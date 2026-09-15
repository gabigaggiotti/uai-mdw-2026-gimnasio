/**
 * Schemas de validación de la entidad Cuota.
 *
 * Una cuota es historial de pago: no hay editarCuotaSchema porque una
 * vez creada no se corrige, se registra una nueva.
 */
import { z } from "zod";

export const modoPagoSchema = z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"]);

export const crearCuotaSchema = z.object({
  suscripcionId: z.string().cuid("suscripcionId no es válido"),
  fechaPago: z
    .coerce
    .date()
    .refine((fecha) => fecha.getTime() <= Date.now(), {
      message: "No se puede registrar un pago con fecha futura",
    }),
  modoPago: modoPagoSchema,
  monto: z.number().positive("El monto tiene que ser mayor a 0"),
  periodoCorrespondiente: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El formato tiene que ser AAAA-MM"),
});

export type CrearCuotaInput = z.infer<typeof crearCuotaSchema>;
