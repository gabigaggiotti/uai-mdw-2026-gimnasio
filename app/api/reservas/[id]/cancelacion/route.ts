import { NextResponse } from "next/server";
import { cancelarReserva, obtenerReserva } from "@/lib/db/reservas";
import { manejarError } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "CANCELADA" }: cancelar es una transición
 * con su propio permiso (el dueño de la reserva o un Administrador,
 * nunca cualquier autenticado) y su propia regla a futuro (por ejemplo,
 * no permitir cancelar pasada cierta anticipación — falta definir en
 * docs/spec.md).
 */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  // TODO (clase 6): requerirUsuario(["CLIENTE", "ADMINISTRADOR"]) +
  // verificar que si es CLIENTE, la reserva sea la suya.
  const reserva = await obtenerReserva(id);

  if (!reserva) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (reserva.estado === "CANCELADA") {
    return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 409 });
  }

  try {
    const reservaCancelada = await cancelarReserva(id);
    return NextResponse.json(reservaCancelada);
  } catch (error) {
    return manejarError(error);
  }
}
