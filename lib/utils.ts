import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind resolviendo conflictos (lo usa shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea la fecha de una reserva para mostrarla: "lunes 16 de noviembre".
 *
 * La fecha de una reserva representa un día calendario y se guarda a
 * medianoche UTC, por eso se formatea en UTC: si se formateara en la zona
 * del navegador (UTC−3) daría el día anterior. Se llama siempre en el
 * servidor y al cliente viaja el texto ya armado (clase 8).
 */
export function formatearDia(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(fecha);
}

/** "2026-11-16": el valor de un día para un formulario o una URL. */
export function aIsoDia(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
