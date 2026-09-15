/**
 * Schemas de validación de la entidad Profesor.
 *
 * Dar de alta un profesor crea también su Usuario (con rol PROFESOR):
 * por eso el schema de creación pide email y nombre además de los datos
 * propios del perfil. Editar, en cambio, solo toca el perfil.
 */
import { z } from "zod";

export const crearProfesorSchema = z.object({
  email: z.string().trim().email("El email no es válido"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre necesita al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  especialidad: z
    .string()
    .trim()
    .min(3, "La especialidad necesita al menos 3 caracteres")
    .max(60, "La especialidad no puede superar los 60 caracteres"),
  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional(),
});

export type CrearProfesorInput = z.infer<typeof crearProfesorSchema>;

export const editarProfesorSchema = z
  .object({
    especialidad: z
      .string()
      .trim()
      .min(3, "La especialidad necesita al menos 3 caracteres")
      .max(60, "La especialidad no puede superar los 60 caracteres"),
    telefono: z.string().trim().max(20, "El teléfono no puede superar los 20 caracteres"),
    activo: z.boolean(),
  })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  });

export type EditarProfesorInput = z.infer<typeof editarProfesorSchema>;
