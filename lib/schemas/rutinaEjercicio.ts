/**
 * Schemas de validación de la entidad RutinaEjercicio: la composición
 * de una rutina, no un CRUD de ejercicios. rutinaId sale de la ruta
 * (POST /api/rutinas/:id/ejercicios), no del body.
 */
import { z } from "zod";

export const agregarEjercicioARutinaSchema = z.object({
  ejercicioId: z.string().cuid("ejercicioId no es válido"),
  series: z
    .number()
    .int("Las series tienen que ser un número entero")
    .positive("Las series tienen que ser mayor a 0"),
  repeticiones: z
    .number()
    .int("Las repeticiones tienen que ser un número entero")
    .positive("Las repeticiones tienen que ser mayor a 0"),
  orden: z
    .number()
    .int("El orden tiene que ser un número entero")
    .nonnegative("El orden no puede ser negativo"),
});

export type AgregarEjercicioARutinaInput = z.infer<typeof agregarEjercicioARutinaSchema>;

export const editarEjercicioDeRutinaSchema = agregarEjercicioARutinaSchema
  .omit({ ejercicioId: true })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  });

export type EditarEjercicioDeRutinaInput = z.infer<typeof editarEjercicioDeRutinaSchema>;
