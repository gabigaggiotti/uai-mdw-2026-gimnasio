/**
 * Schemas de validación de la entidad Ejercicio.
 */
import { z } from "zod";

export const crearEjercicioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre necesita al menos 3 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  grupoMuscular: z
    .string()
    .trim()
    .min(3, "El grupo muscular necesita al menos 3 caracteres")
    .max(40, "El grupo muscular no puede superar los 40 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional(),
});

export type CrearEjercicioInput = z.infer<typeof crearEjercicioSchema>;

export const editarEjercicioSchema = crearEjercicioSchema
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  });

export type EditarEjercicioInput = z.infer<typeof editarEjercicioSchema>;
