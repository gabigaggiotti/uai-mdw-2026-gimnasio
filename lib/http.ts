/**
 * Traduce un error lanzado por `lib/db/` a la respuesta HTTP que le
 * corresponde. Vive acá y no repetido en cada Route Handler porque el
 * mapeo (qué status, qué mensaje) es el mismo en toda la API.
 */
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { CupoAgotadoError } from "@/lib/db/errors";

export function manejarError(error: unknown, entidadEnUso?: string): NextResponse {
  if (error instanceof CupoAgotadoError) {
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
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
