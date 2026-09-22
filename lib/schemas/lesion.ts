/**
 * Schemas de validación de la entidad Lesion.
 *
 * estado no se pide al crear: toda lesión nace ACTIVA. Pasa a
 * RECUPERADA por su propio endpoint (POST /api/lesiones/:id/recuperacion),
 * sin body.
 */
import { z } from "zod";

export const gravedadSchema = z.enum(["LEVE", "MODERADA", "GRAVE"]);

export const crearLesionSchema = z.object({
  clienteId: z.string().cuid("clienteId no es válido"),
  descripcion: z
    .string()
    .trim()
    .min(3, "La descripción necesita al menos 3 caracteres")
    .max(500, "La descripción no puede superar los 500 caracteres"),
  zonaAfectada: z
    .string()
    .trim()
    .min(2, "La zona afectada necesita al menos 2 caracteres")
    .max(60, "La zona afectada no puede superar los 60 caracteres"),
  gravedad: gravedadSchema,
  observaciones: z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")
    .optional(),
});

export type CrearLesionInput = z.infer<typeof crearLesionSchema>;

export const editarLesionSchema = crearLesionSchema
  .omit({ clienteId: true })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  });

export type EditarLesionInput = z.infer<typeof editarLesionSchema>;
