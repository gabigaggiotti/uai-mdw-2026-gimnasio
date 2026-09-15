/**
 * Schemas de validación de la entidad Plan.
 */
import { z } from "zod";

export const crearPlanSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre necesita al menos 3 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción no puede estar vacía")
    .max(500, "La descripción no puede superar los 500 caracteres"),
  precio: z
    .number()
    .positive("El precio tiene que ser mayor a 0"),
  duracionDias: z
    .number()
    .int("La duración tiene que ser un número entero de días")
    .positive("La duración tiene que ser mayor a 0"),
  clasesPorSemana: z
    .number()
    .int("Las clases por semana tienen que ser un número entero")
    .positive("Las clases por semana tienen que ser mayor a 0")
    .optional(),
});

export type CrearPlanInput = z.infer<typeof crearPlanSchema>;

export const editarPlanSchema = crearPlanSchema
  .partial()
  .extend({ activo: z.boolean().optional() })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  });

export type EditarPlanInput = z.infer<typeof editarPlanSchema>;
