import { NextResponse } from "next/server";
import { cancelarReserva, obtenerReserva } from "@/lib/db/reservas";
import { manejarHandler } from "@/lib/http";
import { requerirUsuario } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * POST y no PATCH { estado: "CANCELADA" }: cancelar es una transición
 * con su propio permiso (el dueño de la reserva o un Administrador,
 * nunca cualquier autenticado) y su propia regla a futuro (por ejemplo,
 * no permitir cancelar pasada cierta anticipación — falta definir en
 * docs/spec.md).
 */
export const POST = manejarHandler("POST /api/reservas/:id/cancelacion", async (_request: Request, { params }: Params) => {
  const usuario = await requerirUsuario(["CLIENTE", "ADMINISTRADOR"]);
  const { id } = await params;
  const clienteId = usuario.rol === "CLIENTE" ? usuario.id : undefined;
  const reserva = await obtenerReserva(id, clienteId);

  if (!reserva) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (reserva.estado === "CANCELADA") {
    return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 409 });
  }

  const reservaCancelada = await cancelarReserva(id, clienteId);
  if (!reservaCancelada) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(reservaCancelada);
});
