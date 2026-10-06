/**
 * Traduce un error lanzado por `lib/db/` a la respuesta HTTP que le
 * corresponde. Vive acá y no repetido en cada Route Handler porque el
 * mapeo (qué status, qué mensaje) es el mismo en toda la API.
 */
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { NoAutenticado, NoAutorizado } from "@/lib/auth";
import {
  CancelacionFueraDeTiempoError,
  CupoAgotadoError,
  SinSuscripcionVigenteError,
  SuperposicionDeTurnosError,
} from "@/lib/db/errors";

export function responderError(
  endpoint: string,
  error: unknown,
  entidadEnUso?: string,
): NextResponse {
  if (error instanceof NoAutenticado) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (error instanceof NoAutorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (
    error instanceof CupoAgotadoError ||
    error instanceof SinSuscripcionVigenteError ||
    error instanceof SuperposicionDeTurnosError ||
    error instanceof CancelacionFueraDeTiempoError
  ) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025: findUniqueOrThrow o update/delete sobre un id que no existe.
    if (error.code === "P2025") {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // P2003: violación de foreign key. Con onDelete: Restrict, pasa al
    // intentar borrar algo que todavía tiene registros asociados.
    if (error.code === "P2003") {
      const detalle = entidadEnUso ? ` porque tiene ${entidadEnUso} asociadas` : "";
      return NextResponse.json({ error: `No se puede eliminar${detalle}` }, { status: 409 });
    }
  }

  // Nunca llega acá a propósito: si llega, es un bug nuestro, no del cliente.
  console.error(endpoint, error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export function manejarError(error: unknown, entidadEnUso?: string): NextResponse {
  return responderError("API", error, entidadEnUso);
}

export function manejarHandler<TArgs extends unknown[]>(
  endpoint: string,
  handler: (...args: TArgs) => Promise<NextResponse>,
  entidadEnUso?: string,
) {
  return async (...args: TArgs): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return responderError(endpoint, error, entidadEnUso);
    }
  };
}
