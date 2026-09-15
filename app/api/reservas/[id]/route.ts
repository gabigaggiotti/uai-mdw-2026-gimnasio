import { NextResponse } from "next/server";
import { obtenerReserva } from "@/lib/db/reservas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  // TODO (clase 6): requerirUsuario(["CLIENTE"]) y verificar que la
  // reserva sea del cliente de la sesión (o que sea ADMINISTRADOR) →
  // si no, 404 (ver AGENTS.md / sección 8 del material: un recurso que
  // existe pero no es suyo también es 404, no 403, para no revelar que
  // existe).
  const reserva = await obtenerReserva(id);

  if (!reserva) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(reserva);
}
