/**
 * Schemas de validación de la entidad Clase.
 *
 * diaSemana es unión literal, no string: son 7 valores conocidos y
 * cualquier otro texto es un error del cliente, no un caso a soportar.
 */
import { z } from "zod";

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const diaSemanaSchema = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

export const crearClaseSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, "El nombre necesita al menos 3 caracteres")
      .max(60, "El nombre no puede superar los 60 caracteres"),
    disciplina: z
      .string()
      .trim()
      .min(3, "La disciplina necesita al menos 3 caracteres")
      .max(40, "La disciplina no puede superar los 40 caracteres"),
    profesorId: z.string().cuid("profesorId no es válido"),
    diaSemana: diaSemanaSchema,
    horaInicio: z.string().regex(HORA_REGEX, "El formato tiene que ser HH:MM"),
    horaFin: z.string().regex(HORA_REGEX, "El formato tiene que ser HH:MM"),
    cupoMaximo: z
      .number()
      .int("El cupo tiene que ser un número entero")
      .positive("El cupo tiene que ser mayor a 0"),
    salon: z.string().trim().max(40, "El salón no puede superar los 40 caracteres").optional(),
  })
  .refine((datos) => datos.horaInicio < datos.horaFin, {
    message: "horaInicio tiene que ser anterior a horaFin",
    path: ["horaFin"],
  });

export type CrearClaseInput = z.infer<typeof crearClaseSchema>;

export const editarClaseSchema = z
  .object({
    nombre: z.string().trim().min(3).max(60),
    disciplina: z.string().trim().min(3).max(40),
    profesorId: z.string().cuid("profesorId no es válido"),
    diaSemana: diaSemanaSchema,
    horaInicio: z.string().regex(HORA_REGEX, "El formato tiene que ser HH:MM"),
    horaFin: z.string().regex(HORA_REGEX, "El formato tiene que ser HH:MM"),
    cupoMaximo: z.number().int().positive(),
    salon: z.string().trim().max(40),
    activa: z.boolean(),
  })
  .partial()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Hay que enviar al menos un campo para editar",
  })
  .refine(
    (datos) => !datos.horaInicio || !datos.horaFin || datos.horaInicio < datos.horaFin,
    { message: "horaInicio tiene que ser anterior a horaFin", path: ["horaFin"] },
  );

export type EditarClaseInput = z.infer<typeof editarClaseSchema>;
