/**
 * Schemas de validación de la entidad Rutina.
 *
 * estado no se pide al crear: toda rutina nace INACTIVA. Se activa por
 * su propio endpoint (POST /api/rutinas/:id/activacion), que además
 * desactiva la que estaba activa — esa regla vive en lib/db/rutinas.ts,
 * no acá.
 */
import { z } from "zod";

export const crearRutinaSchema = z.object({
  clienteId: z.string().cuid("clienteId no es válido"),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre necesita al menos 3 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
});

export type CrearRutinaInput = z.infer<typeof crearRutinaSchema>;

export const editarRutinaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre necesita al menos 3 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
});

export type EditarRutinaInput = z.infer<typeof editarRutinaSchema>;
